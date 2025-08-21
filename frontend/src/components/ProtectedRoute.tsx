import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'

export function ProtectedRoute({ children }: { children: ReactNode }) {
	const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
	const restore = useAuthStore(s => s.restore)
	const isLoading = useAuthStore(s => s.isLoading)
	const location = useLocation()

	useEffect(() => {
		if (!isAuthenticated && !isLoading) {
			restore()
		}
	}, [restore])

	if (isLoading) return <div>Loading...</div>

	if (!isAuthenticated && !isLoading) {
		return <Navigate to="/sign-in" replace state={{ from: location, message: 'Please sign in to continue.' }} />
	}

	return <>{children}</>
}
