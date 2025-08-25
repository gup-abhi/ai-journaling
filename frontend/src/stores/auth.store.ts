import { create } from 'zustand'
import { api, safeRequest } from '@/lib/api'
import toast from 'react-hot-toast'

export type AuthUser = {
  display_name: string,
  full_name: string,
  email: string,
  email_verified: boolean,
  phone_verified: boolean,
  sub: string
}

type AuthState = {
  user: AuthUser | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  setIsAuthenticated: (value: boolean) => void
  signUp: (payload: { email: string; password: string; display_name: string }) => Promise<{ ok: boolean; message?: string }>
  signIn: (payload: { email: string; password: string }) => Promise<{ ok: boolean }>
  signInWithGoogle: () => Promise<{ ok: boolean }>
  signOut: () => Promise<void>
  restore: () => void
  getUser: () => Promise<void>
}

const channel = new BroadcastChannel('auth-channel');

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  setIsAuthenticated: (value) => {
    set({ isAuthenticated: value })
    channel.postMessage({ isAuthenticated: value })
  },

  restore: async () => {
    set({ isLoading: true })

    const res = await safeRequest(api.get('/auth/check', { withCredentials: true }))
    console.log('Auth check response:', res)
    set({  isLoading: false, isAuthenticated: res.ok })
    if (res.ok) {
      useAuthStore.getState().getUser()
    }
    channel.postMessage({ isAuthenticated: res.ok })
  },


  signUp: async (payload) => {
    set({ isLoading: true, error: null })
    const res = await safeRequest(api.post('/auth/signup', payload, { withCredentials: true }))
    set({ isLoading: false, error: res.ok ? null : res.error })
    if (res.ok) {
      toast.success('Verification email sent. Please check your inbox.')
      return { ok: true, message: 'Verification email sent. Please check your inbox.' }
    } else {
      toast.error(res.error || 'Sign up failed')
      return { ok: false }
    }
  },

  signIn: async (payload) => {
    set({ isLoading: true, error: null })
    const res = await safeRequest(api.post('/auth/login', payload, { withCredentials: true }))
    if (res.ok) {
      // Backend sets cookie → we consider user authenticated
      set({ isLoading: false, isAuthenticated: true })
      channel.postMessage({ isAuthenticated: true })
      useAuthStore.getState().getUser()
      toast.success('Signed in successfully!')
      return { ok: true }
    } else {
      set({ isLoading: false, error: res.error, isAuthenticated: false })
      channel.postMessage({ isAuthenticated: false })
      toast.error(res.error || 'Sign in failed')
      return { ok: false }
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      // Redirect to backend for Google OAuth initiation
      window.location.href = '/api/v1/auth/google/login';
      return { ok: true };
    } catch (err: any) {
      set({ isLoading: false, error: err.message, isAuthenticated: false });
      channel.postMessage({ isAuthenticated: false })
      toast.error(err.message || 'Google Sign-In failed');
      return { ok: false };
    }
  },

  signOut: async () => {
    await safeRequest(api.get('/auth/logout', { withCredentials: true }))
    set({ user: null, isAuthenticated: false })
    sessionStorage.removeItem('isAuthenticated');
    channel.postMessage({ isAuthenticated: false })
    toast.success('Signed out successfully!')
  },


  getUser: async () => {
    const res = await safeRequest(api.get('/auth/user', { withCredentials: true }))
    if (res.ok) {
      set({ user: res.data })
    } else {
      set({ user: null })
    }
  }
}))

channel.onmessage = (event) => {
  if (event.data.isAuthenticated !== useAuthStore.getState().isAuthenticated) {
    useAuthStore.setState({ isAuthenticated: event.data.isAuthenticated })
    if (event.data.isAuthenticated) {
      useAuthStore.getState().getUser()
    } else {
      useAuthStore.setState({ user: null })
    }
  }
};

// Initial check on load
useAuthStore.getState().restore()

export const getAuthStore = () => useAuthStore.getState()