import { create } from 'zustand'
import { api, safeRequest, type ApiErr, type ApiOk } from '../lib/api'
import { getAuthTokens, setAuthTokens, removeAuthTokens } from '../lib/auth-tokens'

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
  setIsLoading: (value: boolean) => void
  signUp: (payload: { email: string; password: string; display_name: string }) => Promise<{ ok: boolean; message?: string }>
  signIn: (payload: { email: string; password: string }) => Promise<{ ok: boolean }>
  signInWithGoogle: () => Promise<{ ok: boolean }>
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
  setIsLoading: (value) => set({ isLoading: value }),

  restore: async () => {
    try {
      set({ isLoading: true, error: null })
      
      // Check if we have a stored token first
      const { access_token, refresh_token } = await getAuthTokens()

      // console.log('Restoring auth, checking token:', access_token, refresh_token)

      // If no token, set unauthenticated state
      if (!access_token && !refresh_token) {
        set({ isLoading: false, isAuthenticated: false, user: null })
        return
      }

      // Try to validate the token with the backend
      const res = await safeRequest(api.get('/auth/check', { withCredentials: true }))
      const valid = (res as any).ok;

      // console.log('Token validation result:', res);
      
      if (valid) {
        set({ isAuthenticated: true, isLoading: false })
      }
    } catch (error) {
      console.error('Auth restore error:', error)
      // Clear any stored token on error
      await removeAuthTokens()
      set({ isAuthenticated: false, user: null, error: 'Authentication failed' })
    } finally {
      set({ isLoading: false })
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
        const access_token = anyRes.data?.access_token as string | undefined
        const refresh_token = anyRes.data?.refresh_token as string | undefined
        
        await setAuthTokens(access_token, refresh_token)
        set({ error: null, isAuthenticated: true })

        return { ok: true }
      } else {
        set({ error: (res as ApiErr).error || 'Sign in failed.', isAuthenticated: false })
        return { ok: false }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      set({ isLoading: false, error: 'Sign in failed. Please try again.', isAuthenticated: false })
      return { ok: false }
    } finally {
      set({ isLoading: false })
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

  handleGoogleOAuthTokens: async (accessToken: string, refreshToken?: string) => {
    try {
      set({ isLoading: true, error: null });

      // console.log(`Setting Tokens - ${accessToken} ${refreshToken}`)
      
      // Store the access token
      await setAuthTokens(accessToken, refreshToken);
      
      // Set authenticated state immediately
      set({ isAuthenticated: true });
      
      return { ok: true };
    } catch (error) {
      console.error('Google OAuth token handling error:', error);
      set({ isLoading: false, error: 'Failed to store OAuth tokens' });
      return { ok: false };
    } finally {
      set({ isLoading: false })
    }
  },

  signOut: async () => {
    try {
      await safeRequest(api.get('/auth/logout', { withCredentials: true }))
      await removeAuthTokens();
    } catch (error) {
      console.error('Logout API error:', error)
      // Continue with local cleanup even if API call fails
    } finally {
      // Always clear local state and token
      set({ user: null, isAuthenticated: false, isLoading: false, error: null })
    }
  },

  getUser: async () => {
    try {
      const res = await safeRequest(api.get('/auth/user', { withCredentials: true }))
      // console.log(`/auth/user response - ${JSON.stringify(res)}`)
      if (res.ok) {
        set({ user: res.data })
      } else {
        console.error('Failed to get user data:', (res as ApiErr).error)
        set({ user: null })
      }
    } catch (error) {
      console.error('Get user error:', error)
      set({ user: null })
    }
  }
}))

export const getAuthStore = () => useAuthStore.getState()

