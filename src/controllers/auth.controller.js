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

    // console.log(data);

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

    // Store access token in secure cookie
    res.cookie("access_token", data.session.access_token, {
      httpOnly: true,   // cannot be accessed by JS (secure)
      secure: false,     // only over HTTPS (set false for localhost dev)
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    res.cookie("user_id", user_id, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    return res.status(200).json({ message: "User logged in successfully." });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const logoutUser = async (req, res) => {
  const token = req.cookies.access_token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(400).json({ error: "No token provided." });
  }

  try {
      const { error } = await supabase.auth.signOut({ JWT: token });

      if (error) {
          return res.status(400).json({ error: error.message });
      }

      res.clearCookie("access_token");
      res.clearCookie("user_id");
      return res.status(200).json({ message: "User logged out successfully." });
  } catch (error) {
      return res.status(500).json({ error: error.message });
  }
};