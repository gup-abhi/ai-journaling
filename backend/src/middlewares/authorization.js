import supabase from "../lib/supabase-client.js";
import cookieOptions from '../util/cookiesOptions.js';

export const validateToken = async (req, res, next) => {
  try {
    // First try Authorization header
    let token = req.cookies.access_token || req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      res.clearCookie("access_token", cookieOptions);
      res.clearCookie("user_id", cookieOptions);  
      return res.status(401).json({ error: "No token provided, try re-logging in" });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      res.clearCookie("access_token", cookieOptions);
      res.clearCookie("user_id", cookieOptions);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = data.user;
    next();
  } catch (err) {
    console.error("Token validation error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
