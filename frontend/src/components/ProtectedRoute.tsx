import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

export function ProtectedRoute({ children }: { children: ReactNode }) {
	const token = useAuthStore(s => s.token)
	const isAuthenticated = useAuthStore(s => s.isAuthenticated)
	const restore = useAuthStore(s => s.restore)
	const location = useLocation()

	useEffect(() => {
		if (!token && !isAuthenticated) restore()
	}, [token, isAuthenticated, restore])

	if (!token && !isAuthenticated) {
		return <Navigate to="/signin" replace state={{ from: location, message: 'Please sign in to continue.' }} />
	}

	return <>{children}</>
}
