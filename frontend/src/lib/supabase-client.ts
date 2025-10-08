import { createBrowserClient } from '@supabase/ssr'
import Cookies from 'js-cookie'

const supabaseUrl = import.meta.env.VITE_APP_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_APP_SUPABASE_ANON_KEY

export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: {
        getItem: (key) => Cookies.get(key),
        setItem: (key, value) => Cookies.set(key, value, { expires: 365 }), // Set a long expiry for persistence
        removeItem: (key) => Cookies.remove(key),
      },
    },
  }
)