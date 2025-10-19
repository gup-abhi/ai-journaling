import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import logger from "./logger.js";

const { SUPABASE_URL, SUPABASE_SECRET } = process.env;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_SECRET) {
  logger.error("❌ Missing Supabase admin configuration. Check your .env file.");
}

// Try creating client safely
let supabaseAdmin = null;
try {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  logger.info("✅ Supabase admin client initialized successfully");
} catch (err) {
  logger.error(`❌ Failed to initialize Supabase admin client: ${err.message}`);
}

export default supabaseAdmin;
