import { create } from 'zustand'
import { supabase } from '@/lib/supabase-client'
import toast from 'react-hot-toast'
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Define a custom User type that includes user_metadata
export type AuthUser = SupabaseUser & {
  user_metadata: {
    display_name?: string;
    full_name?: string;
    name?: string;
    email?: string;
    [key: string]: unknown; // Allow for arbitrary properties
  };
};

type AuthState = {
  user: AuthUser | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  signUp: (payload: { email: string; password: string; display_name: string }) => Promise<{ ok: boolean; message?: string }>
  signIn: (payload: { email: string; password: string }) => Promise<{ ok: boolean }>
  signInWithGoogle: () => Promise<{ ok: boolean }>
  signOut: () => Promise<void>
  sendPasswordResetEmail: (email: string) => Promise<{ ok: boolean; message?: string }>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  signUp: async (payload) => {
    set({ isLoading: true, error: null })
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          display_name: payload.display_name
        }
      }
    })
    set({ isLoading: false })
    if (error) {
      toast.error(error.message)
      return { ok: false }
    }
    if (data.user) {
      toast.success('Verification email sent. Please check your inbox.')
      return { ok: true, message: 'Verification email sent. Please check your inbox.' }
    }
    return { ok: false }
  },

  signIn: async (payload) => {
    set({ user: null, isAuthenticated: false, error: null, isLoading: true }); // Clear state before new sign-in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    })

    console.log(`data - ${JSON.stringify(data)}`);
    set({ isLoading: false, user: data.user as AuthUser })
    if (error) {
      toast.error(error.message)
      return { ok: false }
    }
    toast.success('Signed in successfully!')
    return { ok: true }
  },

  signInWithGoogle: async () => {
    set({ user: null, isAuthenticated: false, error: null, isLoading: true }); // Clear state before new sign-in
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: import.meta.env.VITE_FRONTEND_URL,
      },
    });
    set({ isLoading: false })
    if (error) {
      toast.error(error.message)
      return { ok: false }
    }
    return { ok: true };
  },

  sendPasswordResetEmail: async (email) => {
    set({ isLoading: true, error: null });
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.VITE_FRONTEND_URL}/reset-password`,
    });
    set({ isLoading: false });
    if (error) {
      toast.error(error.message);
      return { ok: false, message: error.message };
    }
    toast.success('Password reset email sent. Please check your inbox.');
    return { ok: true, message: 'Password reset email sent. Please check your inbox.' };
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, isAuthenticated: false })
    toast.success('Signed out successfully!')
  },
}))

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    useAuthStore.setState({
      user: session?.user as AuthUser ?? null,
      isAuthenticated: true,
      isLoading: false
    })
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    })
  }
});

// Initial check on load
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    useAuthStore.setState({ user: session.user as AuthUser, isAuthenticated: true });
  }
})();

export const getAuthStore = () => useAuthStore.getState()