import User from '../models/Users.model.js';
import supabase from "../lib/supabase-client.js";

export const signUpUser = async (req, res) => {
  const { email, password, display_name } = req.body;

  if (!email || !password || !display_name) {
    return res.status(400).json({ error: "Email, password, and display name are required." });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name,
        },
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ message: "User created successfully. Verify the email to complete the registration." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Adding user in the mongodb for the first time
    const user = {
      email: data.user.email,
      auth_uid: data.user.id,
      display_name: data.user.user_metadata.display_name,
    };

    const userExists = await User.findOne({ email: user.email });

    let user_id = userExists ? userExists._id.toString() : null;

    if (!userExists) {
      const newUser = await User.create(user);
      user_id = newUser._id.toString();
    }

    // Cookie options suitable for cross-site dev (frontend :5173, API :5001)
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProd ? true : false, // allow http on localhost; set true in prod
      sameSite: 'lax', // required for cross-site cookies when using credentials
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    };

    // Store access token in secure cookie
    res.cookie("access_token", data.session.access_token, cookieOptions);
    res.cookie("user_id", user_id, cookieOptions);

    return res.status(200).json({ message: "User logged in successfully." });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const logoutUser = async (req, res) => {
  const token = req.cookies.access_token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    // Clear cookies regardless to ensure removal on client
    const isProd = process.env.NODE_ENV === 'production';
    const clearOpts = { httpOnly: true, secure: isProd ? true : false, sameSite: 'None', path: '/' };
    res.clearCookie("access_token", clearOpts);
    res.clearCookie("user_id", clearOpts);
    return res.status(200).json({ message: "Logged out." });
  }

  try {
      const { error } = await supabase.auth.signOut({ JWT: token });

      if (error) {
          return res.status(400).json({ error: error.message });
      }

      const isProd = process.env.NODE_ENV === 'production';
      const clearOpts = { httpOnly: true, secure: isProd ? true : false, sameSite: 'None', path: '/' };
      res.clearCookie("access_token", clearOpts);
      res.clearCookie("user_id", clearOpts);
      return res.status(200).json({ message: "User logged out successfully." });
  } catch (error) {
      return res.status(500).json({ error: error.message });
  }
};