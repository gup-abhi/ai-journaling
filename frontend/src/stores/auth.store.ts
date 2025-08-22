import { create } from 'zustand'
import { api, safeRequest } from '@/lib/api'
import toast from 'react-hot-toast'

export type AuthUser = {
  id?: string
  email: string
  display_name?: string
  email_verified?: boolean
}

type AuthState = {
  user: AuthUser | null
  isLoading: boolean
  error: string | null
  signUp: (payload: { email: string; password: string; display_name: string }) => Promise<{ ok: boolean; message?: string }>
  signIn: (payload: { email: string; password: string }) => Promise<{ ok: boolean }>
  signOut: () => Promise<void>
  restore: () => void
}

const setSessionStorage = (key: string, value: any) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  restore: async () => {
    set({ isLoading: true })

    const res = await safeRequest(api.get('/auth/check', { withCredentials: true }))
    console.log('Auth check response:', res)
    set({  isLoading: false })
    setSessionStorage('isAuthenticated', res.ok);
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
      set({ isLoading: false })
      setSessionStorage('isAuthenticated', true);
      toast.success('Signed in successfully!')
      return { ok: true }
    } else {
      set({ isLoading: false, error: res.error })
      setSessionStorage('isAuthenticated', false);
      toast.error(res.error || 'Sign in failed')
      return { ok: false }
    }
  },

  signOut: async () => {
    await safeRequest(api.get('/auth/logout', { withCredentials: true }))
    set({ user: null })
    setSessionStorage('isAuthenticated', false);
    toast.success('Signed out successfully!')
  },
}))
