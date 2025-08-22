import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'

export function NotFoundPage() {
  const navigate = useNavigate()
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true'

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
