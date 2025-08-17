import User from '../models/User.model.js';
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

    // Adding user in the mongodb
    const user = {
      email: data.user.email,
      auth_uid: data.user.id,
      display_name: data.user.user_metadata.display_name,
    };

    await User.create(user);

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

    return res.status(200).json({ session: data.session });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const logoutUser = async (req, res) => {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Missing authorization header" });
    }

    try {
        const { error } = await supabase.auth.signOut({ JWT: token });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ message: "User logged out successfully." });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};