import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

export function ProtectedRoute({ children }: { children: ReactNode }) {
	const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
	const restore = useAuthStore(s => s.restore)
	const isLoading = useAuthStore(s => s.isLoading)
	const location = useLocation()

	useEffect(() => {
		console.log('isAuthenticated', isAuthenticated)
		if (!isAuthenticated && !isLoading) {
			restore()
		}
	}, [restore, isAuthenticated, isLoading])

	if (isLoading) return <div>Loading...</div>

	if (!isAuthenticated && !isLoading) {
		return <Navigate to="/signin" replace state={{ from: location, message: 'Please sign in to continue.' }} />
	}

	return <>{children}</>
}
