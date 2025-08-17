import supabase from "../lib/supabase-client.js";

export const validateToken = async (req, res, next) => {
  try {
    // Token comes from client (e.g. Authorization: Bearer <token>)
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ error: "Missing authorization header" });
    }

    const token = authHeader.split(" ")[1]; // Extract token

    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    console.log("Token verification result:", data, error);

    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Attach user info to request for downstream handlers
    req.user = data.user;
    next();
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
