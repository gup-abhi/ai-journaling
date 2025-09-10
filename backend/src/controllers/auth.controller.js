import User from '../models/Users.model.js';
import supabase from "../lib/supabase-client.js";
import cookieOptions from '../util/cookiesOptions.js';
import { FRONTEND_URL, BACKEND_URL } from '../config/index.js';
import AppError from '../util/AppError.js'; // Import AppError
import logger from '../lib/logger.js';

/**
 * Sign up a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const signUpUser = async (req, res) => {
  const { email, password, display_name } = req.body;

  if (!email || !password || !display_name) {
    throw new AppError("Email, password, and display name are required.", 400);
  }

  // Check if user already exists in MongoDB
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("User with this email already exists.", 400);
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
      throw new AppError(error.message, 400);
    }

    return res.status(201).json({ message: "User created successfully. Verify the email to complete the registration." });
  } catch (error) {
    throw new AppError(error.message, 500);
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
    throw new AppError("Email and password are required.", 400);
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AppError(error.message, 400);
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
    res.cookie("refresh_token", data.session.refresh_token, cookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days for refresh token

    // Also return tokens in body for mobile clients that cannot use cookies
    return res.status(200).json({
      message: "User logged in successfully.",
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  } catch (error) {
    logger.error(`Login error: ${error}`);
    throw new AppError(error.message, 500);
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
  res.clearCookie("refresh_token", cookieOptions());

  if (!token) {
    return res.status(200).json({ message: "Logged out." });
  }

  try {
    const { error } = await supabase.auth.signOut({ JWT: token });

    if (error) {
      logger.error(`Supabase signOut error: ${error}`);
      // Still return 200 since cookies are cleared
      return res.status(200).json({ message: "Logged out, but Supabase signOut failed." });
    }

    return res.status(200).json({ message: "User logged out successfully." });
  } catch (error) {
    logger.error(`Logout error: ${error}`);
    throw new AppError(error.message, 500);
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
    // Check if user wants to force account selection (default: true)
    const forceAccountSelection = req.query.force_account_selection !== 'false';
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
            // This is the crucial part for server-side auth
            flowType: 'pkce', 
            // Make sure this is the full URL to your callback route
            redirectTo: `${BACKEND_URL}/api/v1/auth/google/callback`, 
            // Force account selection - this will show the account picker
            // Users can choose from multiple Google accounts
            queryParams: forceAccountSelection ? {
              prompt: 'select_account',
              access_type: 'offline'
            } : {
              access_type: 'offline'
            }
        },
    });

    if (error) throw new AppError(error.message, 400);

    // Redirect the user to Google login page
    return res.redirect(data.url);
  } catch (err) {
    logger.error(`Google login error: ${err}`);
    throw new AppError("Internal server error", 500);
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
  const userAgent = req.get('User-Agent') || '';
  const isMobileApp = req.get('X-Mobile-App') === 'true' || req.query.mobile === 'true';
  const isMobile = isMobileApp || userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone') || userAgent.includes('ReactNative') || userAgent.includes('Expo');

  logger.info(`Google callback code: ${code}, isMobile: ${isMobile}, isMobileApp: ${isMobileApp}, User-Agent: ${userAgent}`);

  try {
    if (code) {
      // const supabase = createClient(req, res); // Create a Supabase client with the request context
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        logger.error(`Error exchanging code for session: ${error}`);
        throw new AppError("Failed to login with Google", 401);
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
        res.cookie("access_token", session.access_token, cookieOptions(60 * 1000));
        res.cookie("refresh_token", session.refresh_token, cookieOptions(7 * 24 * 60 * 60 * 1000));

        // 3️⃣ Handle redirect based on client type
        if (isMobile) {
          // For mobile app, return a success page that includes tokens for the mobile app
          return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Google Sign-In Success</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body>
              <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
                <h2>✅ Google Sign-In Successful!</h2>
                <p>You can now close this window and return to the app.</p>
                <script>
                  // Notify the mobile app that authentication was successful with tokens
                  if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'AUTH_SUCCESS',
                      message: 'Google sign-in successful',
                      access_token: '${session.access_token}',
                      refresh_token: '${session.refresh_token}'
                    }));
                  }
                </script>
              </div>
            </body>
            </html>
          `);
        } else {
          // For web app, redirect to dashboard
          return res.redirect(`${FRONTEND_URL}/dashboard`);
        }
      }
    } else {
       throw new AppError('No code provided in callback.', 400);
    }
  } catch (err) {
    logger.error(`Google callback error: ${err}`);
    throw new AppError("Internal server error", 500);
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

/**
 * Refresh token for mobile devices
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export const refreshTokenMobile = async (req, res, next) => {
  try {
    const refresh_token = req.headers["refresh"]?.split(" ")[1];

    logger.info(`refresh token received - ${refresh_token}`)

    if (!refresh_token) {
      throw new AppError("Refresh token is required", 400);
    }

    // Refresh session using Supabase
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (refreshError) {
      logger.error(`Refresh token error: ${refreshError.message}`);
      throw new AppError("Invalid or expired refresh token", 401);
    }

    // Return the new tokens and user info
    res.status(200).json({
      message: "Tokens refreshed successfully",
      access_token: refreshData.session.access_token,
      refresh_token: refreshData.session.refresh_token,
    });
  } catch (err) {
    logger.error(`refreshTokenMobile error: ${err}`);
    if (err instanceof AppError) {
      next(err);
    } else {
      next(new AppError("Internal server error", 500));
    }
  }
};