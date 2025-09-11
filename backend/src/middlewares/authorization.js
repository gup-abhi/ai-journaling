import supabase from "../lib/supabase-client.js";
import cookieOptions from '../util/cookiesOptions.js';
import AppError from "../util/AppError.js";
import User from '../models/Users.model.js';
import logger from "../lib/logger.js";
import { verifyProjectJWT } from '../util/verifyJWT.js';

export const validateToken = async (req, res, next) => {
  try {
    let access_token = req.cookies.access_token || req.headers["authorization"]?.split(" ")[1];
    let refresh_token = req.cookies.refresh_token || req.headers["refresh"]?.split(" ")[1];

    logger.info(`Token validation - Access token: ${!!access_token}, Refresh token: ${!!refresh_token}`);

    if (!access_token && !refresh_token) {
      handleNoTokens(req, res);
      throw new AppError("No token provided, try re-logging in", 401);
    }

    let userId;
    let tokenRefreshed = false;

    // Try access token first if available
    if (access_token) {
      try {
        const { payload } = await verifyProjectJWT(access_token);
        userId = payload.sub;
        logger.info(`Access token valid for user: ${userId}`);
      } catch (jwtError) {
        logger.warn(`Access token invalid: ${jwtError.message}`);
        access_token = null; // Mark as invalid
      }
    }

    // If access token failed or doesn't exist, try refresh
    if (!userId && refresh_token) {
      logger.info("Attempting token refresh...");
      const refreshResult = await refreshTokens(req, res, refresh_token);
      if (refreshResult) {
        userId = refreshResult.userId;
        tokenRefreshed = true;
        logger.info(`Token refresh successful for user: ${userId}`);
      } else {
        logger.error("Token refresh failed");
      }
    }

    if (!userId) {
      handleAuthenticationFailure(req, res);
      throw new AppError("Authentication failed - invalid or expired tokens", 401);
    }

    // Get user from MongoDB
    const mongoUser = await User.findOne({ auth_uid: userId });
    if (!mongoUser) {
      handleAuthenticationFailure(req, res);
      throw new AppError("User not found in application database.", 404);
    }

    req.user = mongoUser;
    req.tokenRefreshed = tokenRefreshed;

    next();
  } catch (err) {
    logger.error(`Token validation error: ${err.message}`);
    
    if (!(err instanceof AppError)) {
      handleAuthenticationFailure(req, res);
    }
    
    next(err instanceof AppError ? err : new AppError("Authentication failed", 401));
  }
};

const refreshTokens = async (req, res, refresh_token) => {
  if (!refresh_token) {
    logger.error("No refresh token provided for token refresh");
    return null;
  }

  try {
    logger.info("Calling Supabase refresh session...");
    
    // Make sure the refresh token is clean (no Bearer prefix)
    const cleanRefreshToken = refresh_token.replace('Bearer ', '');
    
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({ 
      refresh_token: cleanRefreshToken 
    });

    if (refreshError) {
      logger.error(`Supabase refresh error: ${refreshError.message}`);
      return null;
    }

    if (!refreshData?.session) {
      logger.error("No session returned from Supabase refresh");
      return null;
    }

    const { session, user } = refreshData;
    
    if (!session.access_token || !session.refresh_token) {
      logger.error("Invalid session tokens returned from Supabase");
      return null;
    }

    // Handle token storage based on client type
    handleTokenStorage(req, res, session);

    logger.info("Token refresh successful");
    return { userId: user.id, session };
    
  } catch (err) {
    logger.error(`Unexpected error during token refresh: ${err.message}`);
    return null;
  }
};

const handleTokenStorage = (req, res, session) => {
  if (isMobileRequest(req)) {
    // For mobile: return tokens in headers
    res.setHeader('X-New-Access-Token', session.access_token);
    res.setHeader('X-New-Refresh-Token', session.refresh_token);
    res.setHeader('X-Token-Expires-At', session.expires_at);
    logger.info("Mobile request - tokens set in response headers");
  } else {
    // For web: set cookies
    const accessTokenExpiry = 60 * 60 * 1000; // 1 hour
    const refreshTokenExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    res.cookie("access_token", session.access_token, cookieOptions(accessTokenExpiry));
    res.cookie("refresh_token", session.refresh_token, cookieOptions(refreshTokenExpiry));
    logger.info("Web request - tokens set in cookies");
  }
};

const handleNoTokens = (req, res) => {
  if (isMobileRequest(req)) {
    res.setHeader('X-Clear-Tokens', 'true');
  } else {
    clearCookies(res);
  }
};

const handleAuthenticationFailure = (req, res) => {
  if (isMobileRequest(req)) {
    res.setHeader('X-Clear-Tokens', 'true');
  } else {
    clearCookies(res);
  }
};

const clearCookies = (res) => {
  res.clearCookie("access_token", cookieOptions());
  res.clearCookie("refresh_token", cookieOptions());
};

export const checkUser = (req, res, next) => {
  if (!req.user) {
    throw new AppError("User not authenticated", 401);
  }
  next();
};

const isMobileRequest = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const hasAuthHeader = req.headers['authorization']?.startsWith('Bearer');
  const hasRefreshHeader = req.headers['refresh']?.startsWith('Bearer');
  
  // More reliable mobile detection
  const mobileIndicators = [
    'ReactNative',
    'Expo',
    'okhttp',
    'CFNetwork', // iOS
    'Mobile', // Generic mobile
    'AI-Journaling' // Your custom user agent
  ];
  
  const isMobileUserAgent = mobileIndicators.some(indicator => 
    userAgent.includes(indicator)
  );
  
  // If using Bearer tokens or mobile user agent, treat as mobile
  return hasAuthHeader || hasRefreshHeader || isMobileUserAgent;
};