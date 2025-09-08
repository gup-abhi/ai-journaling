import supabase from "../lib/supabase-client.js";
import cookieOptions from '../util/cookiesOptions.js';
import AppError from "../util/AppError.js"; // Import AppError
import User from '../models/Users.model.js';
import logger from "../lib/logger.js";

export const validateToken = async (req, res, next) => {
  try {
    // First try Authorization header
    let access_token = req.cookies.access_token || req.headers["authorization"]?.split(" ")[1];
    let refresh_token = req.cookies.refresh_token || req.headers["refresh"]?.split(" ")[1];

    if (!access_token && !refresh_token) {
      clearCookies(res);
      // Throw AppError instead of sending response directly
      throw new AppError("No token provided, try re-logging in", 401);
    }

    let supabaseUser;

    if (access_token) {
      const { data, error } = await supabase.auth.getUser(access_token);

      if (error) {
        // If getNewToken sends a response, it will return true.
        // If it throws an error, it will be caught by the outer try-catch.
        const refreshed = await getNewToken(req, res, refresh_token);
        if (!refreshed) return; // If getNewToken handled the response, stop execution
        supabaseUser = refreshed.user;
      } else {
        supabaseUser = data?.user;
      }
    } else {
      const refreshed = await getNewToken(req, res, refresh_token);
      if (!refreshed) return; // If getNewToken handled the response, stop execution
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
    // If it's an AppError, re-throw it to be caught by the global error handler
    if (err instanceof AppError) {
      next(err);
    } else {
      // For unexpected errors, send a generic 500
      next(new AppError("Internal server error", 500));
    }
  }
};


const clearCookies = (res) => {
  res.clearCookie("access_token", cookieOptions());
  res.clearCookie("refresh_token", cookieOptions());
}

const getNewToken = async (req, res, refresh_token) => {
  // get new access token using refresh token
  try {
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({ refresh_token });
    
    if (refreshError) {
      clearCookies(res);
      // Throw AppError instead of sending response directly
      throw new AppError("Invalid or expired token", 401);
    }

    res.cookie("access_token", refreshData.session.access_token, cookieOptions(60 * 60 * 1000));
    res.cookie("refresh_token", refreshData.session.refresh_token, cookieOptions(7 * 24 * 60 * 60 * 1000));
    return { user: refreshData.user }; // Indicate that token was refreshed successfully
  } catch (err) {
    logger.error(`Error refreshing token: ${err}`);
    clearCookies(res);
    // Throw AppError for the global error handler
    throw new AppError("Error refreshing token", 500);
  }
}

export const checkUser = (req, res, next) => {
  if (!req.user) {
    // Throw AppError instead of sending response directly
    throw new AppError("User not authenticated", 401);
  }
  next();
};