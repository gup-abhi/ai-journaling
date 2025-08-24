import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'

export function ProtectedRoute({ children }: { children: ReactNode }) {
	const { restore, isAuthenticated } = useAuthStore()
	const isLoading = useAuthStore(s => s.isLoading)

	useEffect(() => {
		if (!isAuthenticated && !isLoading) {
			restore()
		}
	}, [restore])

	if (isLoading) return <div>Loading...</div>

	if (!isAuthenticated && !isLoading) {
		return <Navigate to="/sign-in" />
	}

	return <>{children}</>
}
