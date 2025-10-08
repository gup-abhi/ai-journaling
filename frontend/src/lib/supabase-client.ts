import { createClient } from '@supabase/supabase-js'
import Cookies from 'js-cookie'

const supabaseUrl = import.meta.env.VITE_APP_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anonymous key must be defined in .env file')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: (key) => {
        const value = Cookies.get(key)
        return value ?? null
      },
      setItem: (key, value) => {
        Cookies.set(key, value, { expires: 365 })
      },
      removeItem: (key) => {
        Cookies.remove(key)
      },
    },
  },
})