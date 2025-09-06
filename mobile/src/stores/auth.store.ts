import { create } from 'zustand'
import { api, safeRequest, type ApiErr, type ApiOk } from '../lib/api'
import * as SecureStore from 'expo-secure-store'
import { Linking } from 'react-native'
import { ENV } from '../config/env'

export type AuthUser = {
  display_name: string
  full_name: string
  email: string
  email_verified: boolean
  phone_verified: boolean
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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,
  isAuthenticated: false,

  setIsAuthenticated: (value) => set({ isAuthenticated: value }),

  restore: async () => {
    const res = await safeRequest(api.get('/auth/check', { withCredentials: true }))
    const valid = (res as any).ok && (res as any).data && (res as any).data.message === 'User is authenticated.'
    set({ isLoading: false, isAuthenticated: valid })
    if (valid) {
      await useAuthStore.getState().getUser()
    } else {
      set({ user: null })
    }
  },

  signUp: async (payload) => {
    set({ isLoading: true, error: null })
    const res = await safeRequest(api.post('/auth/signup', payload, { withCredentials: true }))
    if ((res as ApiOk<any>).ok) {
      set({ isLoading: false, error: null })
      return { ok: true, message: 'Verification email sent. Please check your inbox.' }
    } else {
      set({ isLoading: false, error: (res as ApiErr).error || 'Sign up failed.' })
      return { ok: false }
    }
  },

  signIn: async (payload) => {
    set({ isLoading: true, error: null })
    const res = await safeRequest(api.post('/auth/login', payload, { withCredentials: true }))
    if ((res as ApiOk<any>).ok) {
      // Prefer token from body (mobile). If not present, fall back to cookie-only with restore.
      const anyRes = res as any
      const token = anyRes.data?.access_token as string | undefined
      if (token) {
        await SecureStore.setItemAsync('auth_token', token)
      }
      await useAuthStore.getState().restore()
      return { ok: true }
    } else {
      set({ isLoading: false, error: (res as ApiErr).error || 'Sign in failed.', isAuthenticated: false })
      return { ok: false }
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      // Navigate to GoogleOAuth screen - the WebView will handle the OAuth flow
      // We'll return success immediately as the navigation will handle the rest
      set({ isLoading: false });
      return { ok: true };
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Google Sign-In failed' });
      return { ok: false };
    }
  },

  signOut: async () => {
    await safeRequest(api.get('/auth/logout', { withCredentials: true }))
    await SecureStore.deleteItemAsync('auth_token')
    set({ user: null, isAuthenticated: false })
  },

  getUser: async () => {
    const res = await safeRequest(api.get('/auth/user', { withCredentials: true }))
    if (res.ok) {
      set({ user: res.data })
    } else {
      set({ user: null })
    }
  },
}))

export const getAuthStore = () => useAuthStore.getState()

