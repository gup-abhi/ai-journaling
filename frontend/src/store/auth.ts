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
		const res = await safeRequest(api.post('/auth/signup', payload))
		if (!res.ok) {
			set({ isLoading: false, error: res.error })
			return { ok: false }
		}
		set({ isLoading: false })
		return { ok: true, message: 'Verification email sent. Please check your inbox to verify before signing in.' }
	},

	signIn: async (payload) => {
		set({ isLoading: true, error: null })
		const res = await safeRequest(api.post('/auth/login', payload))
		if (!res.ok) {
			set({ isLoading: false, error: res.error })
			return { ok: false }
		}
		if (typeof window !== 'undefined') {
			localStorage.setItem(AUTH_FLAG_KEY, '1')
		}
		set({ isLoading: false, isAuthenticated: true })
		return { ok: true }
	},

	signOut: async () => {
		await safeRequest(api.get('/auth/logout'))
		if (typeof window !== 'undefined') {
			localStorage.removeItem(AUTH_TOKEN_KEY)
			localStorage.removeItem(AUTH_USER_KEY)
			localStorage.removeItem(AUTH_FLAG_KEY)
		}
		set({ user: null, token: null, isAuthenticated: false })
	},
}))
