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

    if (!access_token && !refresh_token) {
      clearCookies(res);
      throw new AppError("No token provided, try re-logging in", 401);
    }

    let supabaseUser;

    if (access_token) {
      try {
        // Verify JWT
        const { payload } = await verifyProjectJWT(access_token);
        supabaseUser = { id: payload.sub }; // Map payload to Supabase user object
      } catch (err) {
        logger.warn("Access token invalid or expired, trying refresh:", err);
        const refreshed = await getNewToken(req, res, refresh_token);
        if (!refreshed) return;
        supabaseUser = refreshed.user;
      }
    } else {
      const refreshed = await getNewToken(req, res, refresh_token);
      if (!refreshed) return;
      supabaseUser = refreshed.user;
    }

    if (supabaseUser) {
      const mongoUser = await User.findOne({ auth_uid: supabaseUser.id });
      if (!mongoUser) {
        throw new AppError("User not found in application database.", 404);
      }
      req.user = mongoUser;
    }

    next();
  } catch (err) {
    logger.error(`Token validation error: ${err}`);
    next(err instanceof AppError ? err : new AppError("Internal server error", 500));
  }
};

const clearCookies = (res) => {
  res.clearCookie("access_token", cookieOptions());
  res.clearCookie("refresh_token", cookieOptions());
};

const getNewToken = async (req, res, refresh_token) => {
  if (!refresh_token) {
    clearCookies(res);
    throw new AppError("No refresh token provided", 401);
  }

  try {
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({ refresh_token });
    
    if (refreshError) {
      clearCookies(res);
      throw new AppError("Invalid or expired token", 401);
    }

    res.cookie("access_token", refreshData.session.access_token, cookieOptions(60 * 60 * 1000));
    res.cookie("refresh_token", refreshData.session.refresh_token, cookieOptions(7 * 24 * 60 * 60 * 1000));
    
    return { user: refreshData.user };
  } catch (err) {
    logger.error(`Error refreshing token: ${err}`);
    clearCookies(res);
    throw new AppError("Error refreshing token", 500);
  }
};

export const checkUser = (req, res, next) => {
  if (!req.user) {
    throw new AppError("User not authenticated", 401);
  }
  next();
};
