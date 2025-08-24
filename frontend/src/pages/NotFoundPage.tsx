import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { useAuthStore } from '@/stores/auth.store'

export function NotFoundPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate('/dashboard')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="text-xl text-muted-foreground mb-8">Page Not Found</p>
      <Button onClick={handleGoHome}>Go to Home</Button>
    </div>
  )
}
