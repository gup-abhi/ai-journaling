import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import logger from "./logger.js";

const { SUPABASE_URL, SUPABASE_SECRET } = process.env;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_SECRET) {
  logger.error("❌ Missing Supabase configuration. Check your .env file.");
}

// Try creating client safely
let supabase = null;
try {
  // For refresh token operations, we might need to use the publishable key
  // instead of the secret key
  supabase = createClient(SUPABASE_URL, SUPABASE_SECRET, {
    auth: {
      flowType: "pkce",
      autoRefreshToken: true,
      persistSession: false, // We're handling sessions manually
    },
  });
  logger.info("✅ Supabase client initialized successfully");
  logger.info(`Using Supabase URL: ${SUPABASE_URL}`);
  logger.info(`Using Supabase Secret: ${SUPABASE_SECRET ? 'Present' : 'Missing'}`);
} catch (err) {
  logger.error(`❌ Failed to initialize Supabase client: ${err.message}`);
}

export default supabase;
