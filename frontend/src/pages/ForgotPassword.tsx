import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useAuthStore } from '@/stores/auth.store'
import { Mail, Shield } from 'lucide-react'
import { api } from '@/lib/api'
import axios from 'axios'

export function ForgotPassword() {
  const { sendPasswordResetEmail, isLoading, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    try {
      console.log('API baseURL:', api.defaults.baseURL)
      const response = await api.get(`/auth/user-provider?email=${email}`)
      const isGoogleUser = response.data.isGoogleUser

      if (isGoogleUser) {
        setMessage('You have registered with Google. Please manage your password through your Google account.')
        return
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
        // User not found, but we don't want to reveal this information.
        // We will proceed to send the password reset email, which will not be sent by Supabase,
        // but the user will see a success message.
      } else {
        // For any other error, we can show a generic error message.
        setMessage('An error occurred. Please try again later.')
        return
      }
    }

    const { ok, message } = await sendPasswordResetEmail(email)
    if (ok) {
      setMessage(message || 'Password reset email sent.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
            <CardDescription>Enter your email to receive a password reset link.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input id="email" name="email" type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
              </div>
              {message && <p className="text-sm text-green-600 text-center">{message}</p>}
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link to="/sign-in" className="text-primary hover:underline font-medium">Sign In</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
