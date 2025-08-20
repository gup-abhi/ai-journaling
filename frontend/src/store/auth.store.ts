import { create } from 'zustand'
import { api, safeRequest } from '@/lib/api'

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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  restore: async () => {
    set({ isLoading: true })

    const res = await safeRequest(api.get('/auth/check', { withCredentials: true }))
    console.log('res.ok', res.ok)
    set({ isLoading: false })
    sessionStorage.setItem('isAuthenticated', JSON.stringify(res.ok));
  },
  

  signUp: async (payload) => {
    set({ isLoading: true, error: null })
    const res = await safeRequest(api.post('/auth/signup', payload, { withCredentials: true }))
    set({ isLoading: false, error: res.ok ? null : res.error })
    return res.ok
      ? { ok: true, message: 'Verification email sent. Please check your inbox.' }
      : { ok: false }
  },

  signIn: async (payload) => {
    set({ isLoading: true, error: null })
    const res = await safeRequest(api.post('/auth/login', payload, { withCredentials: true }))
    if (res.ok) {
      // Backend sets cookie → we consider user authenticated
      set({ isLoading: false })
      sessionStorage.setItem('isAuthenticated', JSON.stringify(true));
      return { ok: true }
    } else {
      set({ isLoading: false, error: res.error })
      sessionStorage.setItem('isAuthenticated', JSON.stringify(false));
      return { ok: false }
    }
  },

  signOut: async () => {
    await safeRequest(api.get('/auth/logout', { withCredentials: true }))
    set({ user: null })
    sessionStorage.setItem('isAuthenticated', JSON.stringify(false));
  },
}))
