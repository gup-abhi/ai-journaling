import User from '../models/Users.model.js';
import supabase from "../lib/supabase-client.js";
import cookieOptions from '../util/cookiesOptions.js';
import { FRONTEND_URL, BACKEND_URL } from '../config/index.js';

/**
 * Sign up a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const signUpUser = async (req, res) => {
  const { email, password, display_name } = req.body;

  if (!email || !password || !display_name) {
    return res.status(400).json({ error: "Email, password, and display name are required." });
  }

  // Check if user already exists in MongoDB
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "User with this email already exists." });
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


/**
 * Log in an existing user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
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
    res.cookie("access_token", data.session.access_token, cookieOptions(60 * 60 * 1000));
    res.cookie("user_id", user_id, cookieOptions(7 * 24 * 60 * 60 * 1000));
    res.cookie("refresh_token", data.session.refresh_token, cookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days for refresh token

    return res.status(200).json({ message: "User logged in successfully." });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: error.message });
  }
};


/**
 * Log out the current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const logoutUser = async (req, res) => {
  const token = req.cookies.access_token || req.headers["authorization"]?.split(" ")[1];

  // Always clear cookies
  res.clearCookie("access_token", cookieOptions());
  res.clearCookie("user_id", cookieOptions());
  res.clearCookie("refresh_token", cookieOptions());

  if (!token) {
    return res.status(200).json({ message: "Logged out." });
  }

  try {
    const { error } = await supabase.auth.signOut({ JWT: token });

    if (error) {
      console.error("Supabase signOut error:", error.message);
      // Still return 200 since cookies are cleared
      return res.status(200).json({ message: "Logged out, but Supabase signOut failed." });
    }

    return res.status(200).json({ message: "User logged out successfully." });
  } catch (error) {
    console.error("Logout error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};


/**
 * Log in with Google
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const loginWithGoogle = async (req, res) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
            // This is the crucial part for server-side auth
            flowType: 'pkce', 
            // Make sure this is the full URL to your callback route
            redirectTo: `${BACKEND_URL}/api/v1/auth/google/callback`, 
        },
    });

    if (error) return res.status(400).json({ error: error.message });

    // Redirect the user to Google login page
    return res.redirect(data.url);
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


/**
 * Handle Google OAuth callback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const googleCallback = async (req, res) => {
  const { code } = req.query;

  console.log("Google callback code:", code);

  try {
    if (code) {
      // const supabase = createClient(req, res); // Create a Supabase client with the request context
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Error exchanging code for session:", error);
        return res.status(401).json({ error: "Failed to login with Google" });
      } else {
        const session = data.session;
        const user = session.user;

        // 1️⃣ Add user to MongoDB if first login
        let dbUser = await User.findOne({ email: user.email });
        if (!dbUser) {
          dbUser = await User.create({
            email: user.email,
            auth_uid: user.id,
            display_name: user.user_metadata.full_name || user.user_metadata.name || user.email,
          });
        }

        // 2️⃣ Set cookies for access & refresh tokens
        res.cookie("access_token", session.access_token, cookieOptions(60 * 60 * 1000));
        res.cookie("refresh_token", session.refresh_token, cookieOptions(7 * 24 * 60 * 60 * 1000));
        res.cookie("user_id", dbUser._id.toString(), cookieOptions(7 * 24 * 60 * 60 * 1000));

        // 3️⃣ Redirect user to frontend dashboard
        return res.redirect(`${FRONTEND_URL}/dashboard`);
      }
    } else {
       res.status(400).send('No code provided in callback.');
    }
  } catch (err) {
    console.error("Google callback error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


/**
 * Check if the user is authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const checkAuth = async (req, res) => {
  const token = req.cookies.access_token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  return res.status(200).json({ message: "User is authenticated." });
};


/**
 * Get user details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getUserDetails = async (req, res) => {
  res.status(200).json(req.user);
};