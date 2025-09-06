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
  handleGoogleOAuthSuccess: () => Promise<{ ok: boolean }>
  handleGoogleOAuthTokens: (accessToken: string, refreshToken?: string) => Promise<{ ok: boolean }>
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
    try {
      set({ isLoading: true, error: null })
      
      // Check if we have a stored token first
      const storedToken = await SecureStore.getItemAsync('auth_token')
      if (!storedToken) {
        set({ isLoading: false, isAuthenticated: false, user: null })
        return
      }

      // Try to validate the token with the backend
      const res = await safeRequest(api.get('/auth/check', { withCredentials: true }))
      const valid = (res as any).ok && (res as any).data && (res as any).data.message === 'User is authenticated.'
      
      if (valid) {
        set({ isAuthenticated: true, isLoading: false })
        // Fetch user details after successful authentication
        await useAuthStore.getState().getUser()
      } else {
        // Clear invalid token and reset state
        await SecureStore.deleteItemAsync('auth_token')
        set({ isLoading: false, isAuthenticated: false, user: null })
      }
    } catch (error) {
      console.error('Auth restore error:', error)
      // Clear any stored token on error
      await SecureStore.deleteItemAsync('auth_token')
      await SecureStore.deleteItemAsync('refresh_token')
      set({ isLoading: false, isAuthenticated: false, user: null, error: 'Authentication failed' })
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
    try {
      set({ isLoading: true, error: null })
      const res = await safeRequest(api.post('/auth/login', payload, { withCredentials: true }))
      if ((res as ApiOk<any>).ok) {
        // Store the access token from the response
        const anyRes = res as any
        const token = anyRes.data?.access_token as string | undefined
        if (token) {
          await SecureStore.setItemAsync('auth_token', token)
          // Set authenticated state immediately after storing token
          set({ isAuthenticated: true, isLoading: false })
          // Fetch user details
          await useAuthStore.getState().getUser()
        } else {
          // If no token in response, try restore to check cookie-based auth
          await useAuthStore.getState().restore()
        }
        return { ok: true }
      } else {
        set({ isLoading: false, error: (res as ApiErr).error || 'Sign in failed.', isAuthenticated: false })
        return { ok: false }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      set({ isLoading: false, error: 'Sign in failed. Please try again.', isAuthenticated: false })
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

  handleGoogleOAuthSuccess: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if we're authenticated now by calling restore
      await useAuthStore.getState().restore();
      const { isAuthenticated } = useAuthStore.getState();
      
      if (isAuthenticated) {
        set({ isLoading: false });
        return { ok: true };
      } else {
        set({ isLoading: false, error: 'Authentication failed after Google OAuth' });
        return { ok: false };
      }
    } catch (error) {
      console.error('Google OAuth success handling error:', error);
      set({ isLoading: false, error: 'Failed to complete Google sign-in' });
      return { ok: false };
    }
  },

  handleGoogleOAuthTokens: async (accessToken: string, refreshToken?: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Store the access token
      await SecureStore.setItemAsync('auth_token', accessToken);
      
      // Set authenticated state immediately
      set({ isAuthenticated: true, isLoading: false });
      
      // Fetch user details
      await useAuthStore.getState().getUser();
      
      return { ok: true };
    } catch (error) {
      console.error('Google OAuth token handling error:', error);
      set({ isLoading: false, error: 'Failed to store OAuth tokens' });
      return { ok: false };
    }
  },

  signOut: async () => {
    try {
      await safeRequest(api.get('/auth/logout', { withCredentials: true }))
    } catch (error) {
      console.error('Logout API error:', error)
      // Continue with local cleanup even if API call fails
    } finally {
      // Always clear local state and token
      await SecureStore.deleteItemAsync('auth_token')
      set({ user: null, isAuthenticated: false, isLoading: false, error: null })
    }
  },

  getUser: async () => {
    try {
      const res = await safeRequest(api.get('/auth/user', { withCredentials: true }))
      if (res.ok) {
        set({ user: res.data })
      } else {
        console.error('Failed to get user data:', (res as ApiErr).error)
        set({ user: null, isAuthenticated: false })
        // Clear invalid token if user fetch fails
        await SecureStore.deleteItemAsync('auth_token')
      }
    } catch (error) {
      console.error('Get user error:', error)
      set({ user: null, isAuthenticated: false })
      await SecureStore.deleteItemAsync('auth_token')
    }
  },
}))

export const getAuthStore = () => useAuthStore.getState()

