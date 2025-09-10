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
  supabase = createClient(SUPABASE_URL, SUPABASE_SECRET, {
    auth: {
      flowType: "pkce",
    },
  });
  logger.info("✅ Supabase client initialized successfully");
} catch (err) {
  logger.error(`❌ Failed to initialize Supabase client: ${err.message}`);
}

export default supabase;
