import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { Session } from '@supabase/supabase-js'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'

WebBrowser.maybeCompleteAuthSession()

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
  session: Session | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  setIsAuthenticated: (value: boolean) => void
  setIsLoading: (value: boolean) => void
  signUp: (payload: { email: string; password: string; display_name: string }) => Promise<{ ok: boolean; message?: string }>
  signIn: (payload: { email: string; password: string }) => Promise<{ ok: boolean }>
  signInWithGoogle: () => Promise<{ ok: boolean }>
  signOut: () => Promise<void>
  getUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('onAuthStateChange', event, session)
    set({ session })
    const user = session?.user ?? null
    set({ user: user as unknown as AuthUser })
    set({ isAuthenticated: !!user })
    set({ isLoading: false })
  })

  return {
    user: null,
    session: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,

    setIsAuthenticated: (value) => set({ isAuthenticated: value }),
    setIsLoading: (value) => set({ isLoading: value }),

    signUp: async (payload) => {
      set({ isLoading: true, error: null })
      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: {
            display_name: payload.display_name,
          },
        },
      })
      if (error) {
        set({ isLoading: false, error: error.message || 'Sign up failed.' })
        return { ok: false }
      }
      if (data) {
        set({ isLoading: false, error: null })
        return { ok: true, message: 'Verification email sent. Please check your inbox.' }
      }
      return { ok: false }
    },

    signIn: async (payload) => {
      try {
        set({ isLoading: true, error: null })
        const { data, error } = await supabase.auth.signInWithPassword({
          email: payload.email,
          password: payload.password,
        })
        if (error) {
          set({ error: error.message || 'Sign in failed.', isAuthenticated: false })
          return { ok: false }
        }
        if (data) {
          set({ error: null, isAuthenticated: true })
          return { ok: true }
        }
        return { ok: false }
      } catch (error) {
        console.error('Sign in error:', error)
        set({ isLoading: false, error: 'Sign in failed. Please try again.', isAuthenticated: false })
        return { ok: false }
      } finally {
        set({ isLoading: false })
      }
    },

    signInWithGoogle: async () => {
      set({ isLoading: true, error: null })
      try {
        const redirectUrl = makeRedirectUri({
          path: '/auth/callback',
          scheme: 'ai-journaling',
        })
        console.log('Redirect URL (App Deep Link):', redirectUrl)

        // Use your backend's Google OAuth callback URL here
        const backendCallbackUrl = 'https://ai-journaling.onrender.com/auth/google/callback'
        console.log('Redirect URL (Backend Callback):', backendCallbackUrl)

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: backendCallbackUrl, // Redirect to your backend
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        })
        console.log('Supabase signInWithOAuth data:', data)
        console.log('Supabase signInWithOAuth error:', error)

        if (error) {
          throw error
        }

        if (data?.url) {
          console.log('Opening WebBrowser with URL:', data.url)
          // WebBrowser will open the Google OAuth flow, which will then redirect to backendCallbackUrl
          // Your backend will then redirect to the app's deep link (redirectUrl)
          const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl)
          console.log('WebBrowser result:', res)

          if (res.type === 'success' && res.url) {
            const url = new URL(res.url)
            const params = url.searchParams
            const access_token = params.get('access_token')
            const refresh_token = params.get('refresh_token')
            const id_token = params.get('id_token')
            console.log('Extracted tokens:', { access_token, refresh_token, id_token })

            if (id_token) {
              const { error: signInError } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: id_token,
              })
              console.log('signInWithIdToken error:', signInError)
              if (signInError) throw signInError
              set({ error: null, isAuthenticated: true })
              return { ok: true }
            }
          } else {
            console.log('WebBrowser result type not success:', res.type)
          }
        }
        set({ error: 'Google Sign-In failed: No session data', isAuthenticated: false })
        return { ok: false }
      } catch (error: any) {
        console.error('Google Sign-In error:', error)
        set({ isLoading: false, error: error.message || 'Google Sign-In failed.', isAuthenticated: false })
        return { ok: false }
      } finally {
        set({ isLoading: false })
      }
    },

    signOut: async () => {
      try {
        await supabase.auth.signOut()
      } catch (error) {
        console.error('Logout API error:', error)
      } finally {
        set({ user: null, isAuthenticated: false, isLoading: false, error: null, session: null })
      }
    },

    getUser: async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) {
          console.error('Failed to get user data:', error)
          set({ user: null })
        } else {
          set({ user: data.user as unknown as AuthUser })
        }
      } catch (error) {
        console.error('Get user error:', error)
        set({ user: null })
      }
    },
  }
})

export const getAuthStore = () => useAuthStore.getState()
