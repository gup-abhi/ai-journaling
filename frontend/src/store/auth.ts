import { create } from 'zustand'
import { apiRequest, parseJson } from '@/lib/api'

export type AuthUser = {
	id?: string
	email: string
	display_name?: string
	email_verified?: boolean
}

type AuthState = {
	user: AuthUser | null
	token: string | null
	isAuthenticated: boolean
	isLoading: boolean
	error: string | null
	// actions
	signUp: (payload: { email: string; password: string; display_name: string }) => Promise<{ ok: boolean; message?: string }>
	signIn: (payload: { email: string; password: string }) => Promise<{ ok: boolean }>
	signOut: () => Promise<void>
	restore: () => void
}

const AUTH_TOKEN_KEY = 'auth_token'
const AUTH_USER_KEY = 'auth_user'
const AUTH_FLAG_KEY = 'auth_isAuthenticated'

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	token: null,
	isAuthenticated: false,
	isLoading: false,
	error: null,

	restore: () => {
		const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null
		const userStr = typeof window !== 'undefined' ? localStorage.getItem(AUTH_USER_KEY) : null
		const flag = typeof window !== 'undefined' ? localStorage.getItem(AUTH_FLAG_KEY) : null
		const user = userStr ? (JSON.parse(userStr) as AuthUser) : null
		set({ token, user, isAuthenticated: !!flag || !!token || !!user })
	},

	signUp: async (payload) => {
		set({ isLoading: true, error: null })
		try {
			const res = await apiRequest('/auth/signup', {
				method: 'POST',
				body: JSON.stringify(payload),
			})
			const parsed = await parseJson<any>(res)
			if (!parsed.ok) {
				set({ error: parsed.error || 'Sign up failed' })
				return { ok: false }
			}
			return { ok: true, message: 'Verification email sent. Please check your inbox to verify before signing in.' }
		} catch (e: any) {
			set({ error: e?.message || 'Sign up failed' })
			return { ok: false }
		} finally {
			set({ isLoading: false })
		}
	},

	signIn: async (payload) => {
		set({ isLoading: true, error: null })
		try {
			const res = await apiRequest('/auth/login', {
				method: 'POST',
				body: JSON.stringify(payload),
			})
			const parsed = await parseJson<any>(res)
			if (!parsed.ok) {
				set({ error: parsed.error || 'Sign in failed' })
				return { ok: false }
			}
			if (typeof window !== 'undefined') {
				localStorage.setItem(AUTH_FLAG_KEY, '1')
			}
			set({ isAuthenticated: true })
			return { ok: true }
		} catch (e: any) {
			set({ error: e?.message || 'Sign in failed' })
			return { ok: false }
		} finally {
			set({ isLoading: false })
		}
	},

	signOut: async () => {
		try {
			await apiRequest('/auth/logout', { method: 'GET' })
		} catch (_) {
			// ignore network/logout errors; still clear local
		} finally {
			if (typeof window !== 'undefined') {
				localStorage.removeItem(AUTH_TOKEN_KEY)
				localStorage.removeItem(AUTH_USER_KEY)
				localStorage.removeItem(AUTH_FLAG_KEY)
			}
			set({ user: null, token: null, isAuthenticated: false })
		}
	},
}))
