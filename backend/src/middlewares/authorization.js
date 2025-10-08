import supabase from "../lib/supabase-client.js";
import cookieOptions from '../util/cookiesOptions.js';
import AppError from "../util/AppError.js";
import User from '../models/Users.model.js';
import logger from "../lib/logger.js";
import { verifyProjectJWT } from '../util/verifyJWT.js';
import { isMobileRequest } from '../util/mobileDetection.js';

export const validateToken = async (req, res, next) => {
  try {
    let access_token = !isMobileRequest(req) ? req.cookies.access_token : req.headers["authorization"]?.split(" ")[1];

    logger.info(`Token validation - Access token: ${!!access_token}`);

    if (!access_token) {
      throw new AppError("No access token provided", 401);
    }

    let userId;
    let supabaseUserPayload = null; // To store the Supabase user object

    // Try access token first if available
    if (access_token) {
      try {
        const { payload } = await verifyProjectJWT(access_token);
        userId = payload.sub;
        supabaseUserPayload = payload; // Payload contains user details
      } catch (jwtError) {
        logger.warn(`Access token invalid: ${jwtError.message}`);
        throw new AppError("Invalid or expired access token", 401);
      }
    }

    if (!userId || !supabaseUserPayload) {
      throw new AppError("Authentication failed - invalid or expired tokens or user data missing", 401);
    }

    // Get user from MongoDB, create if not found
    let mongoUser = await User.findOne({ auth_uid: userId });
    if (!mongoUser) {
      logger.info(`User with auth_uid ${userId} not found in MongoDB. Creating new user.`);
      mongoUser = await User.create({
        email: supabaseUserPayload.email,
        auth_uid: supabaseUserPayload.sub,
        display_name: supabaseUserPayload.user_metadata.full_name || supabaseUserPayload.user_metadata.name || supabaseUserPayload.email,
      });
    }

    req.user = mongoUser;
    req.tokenRefreshed = false; // No refresh logic, so always false

    next();
  } catch (err) {
    logger.error(`Token validation error: ${err.message}`);
    next(err instanceof AppError ? err : new AppError("Authentication failed", 401));
  }
};

export const checkUser = (req, res, next) => {
  if (!req.user) {
    throw new AppError("User not authenticated", 401);
  }
  next();
};
