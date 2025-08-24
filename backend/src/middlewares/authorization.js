import supabase from "../lib/supabase-client.js";
import cookieOptions from '../util/cookiesOptions.js';

export const validateToken = async (req, res, next) => {
  try {
    // First try Authorization header
    let access_token = req.cookies.access_token || req.headers["authorization"]?.split(" ")[1];
    let refresh_token = req.cookies.refresh_token;

    if (!access_token && !refresh_token) {
      clearCookies(res);
      return res.status(401).json({ error: "No token provided, try re-logging in" });
    }

    if (access_token) {
      const { data, error } = await supabase.auth.getUser(access_token);

      if (error) {
        await getNewToken(req, res, refresh_token);
      } else {
        req.user = data?.user.user_metadata;
      }
    } else {
      await getNewToken(req, res, refresh_token);
    }

    next();
  } catch (err) {
    console.error("Token validation error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const clearCookies = (res) => {
  res.clearCookie("access_token", cookieOptions());
  res.clearCookie("user_id", cookieOptions());
  res.clearCookie("refresh_token", cookieOptions());
}

const getNewToken = async (req, res, refresh_token) => {
  // get new access token using refresh token
  try {
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({ refresh_token });
    
    if (refreshError) {
      clearCookies(res);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = refreshData.user.user_metadata;
    res.cookie("access_token", refreshData.session.access_token, cookieOptions(60 * 60 * 1000));
    res.cookie("refresh_token", refreshData.session.refresh_token, cookieOptions(7 * 24 * 60 * 60 * 1000));
  } catch (err) {
    console.error("Error refreshing token:", err);
    clearCookies(res);
    throw err;
  }
}