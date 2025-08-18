import supabase from "../lib/supabase-client.js";

export const validateToken = async (req, res, next) => {
  try {
    // First try Authorization header
    let token = req.headers["authorization"]?.split(" ")[1];

    // If no header, fallback to cookie
    if (!token && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      return res.status(401).json({ error: "No token provided, try re-logging in" });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = data.user;
    next();
  } catch (err) {
    res.status(500).json({ error: "Token validation failed" });
  }
};
