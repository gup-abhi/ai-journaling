import { createClient } from "@supabase/supabase-js";
import 'dotenv/config'

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Missing Supabase configuration. Check your .env file.");
}

// Try creating client safely
let supabase = null;
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("✅ Supabase client initialized successfully");
} catch (err) {
  console.error("❌ Failed to initialize Supabase client:", err.message);
}

export default supabase;
