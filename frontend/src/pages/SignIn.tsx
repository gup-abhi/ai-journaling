import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { Shield, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { FaGoogle } from 'react-icons/fa'
import { useAuthStore } from '@/stores/auth.store'

export function SignIn() {
  const navigate = useNavigate()
  const { signIn, isLoading, error, signInWithGoogle } = useAuthStore()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address'
    if (!formData.password) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const res = await signIn({ email: formData.email.trim(), password: formData.password })
    if (res.ok) {
      navigate('/dashboard', { state: { message: 'Successfully signed in!' } })
    }
  }

  const handleGoogleSignIn = async () => {
    await signInWithGoogle()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Sign in to continue your AI journaling journey</CardDescription>
            <Badge variant="outline" className="w-fit mx-auto">
              <Shield className="h-3 w-3 mr-1" />
              Secure & private
            </Badge>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input id="email" name="email" type="email" placeholder="Enter your email address" value={formData.email} onChange={handleInputChange} className={errors.email ? 'border-destructive' : ''} disabled={isLoading} />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={formData.password} onChange={handleInputChange} className={errors.password ? 'border-destructive pr-10' : 'pr-10'} disabled={isLoading} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" disabled={isLoading}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot your password?</Link>
              </div>

              {error && <p className="text-sm text-destructive text-center">{error}</p>}

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative my-6">
              <Separator />
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-card px-2 text-xs text-muted-foreground">
                OR
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2"
              size="lg"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <FaGoogle className="h-4 w-4" />
              Sign in with Google
            </Button>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/sign-up" className="text-primary hover:underline font-medium">Sign up</Link>
              </p>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                By signing in, you agree to our <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
