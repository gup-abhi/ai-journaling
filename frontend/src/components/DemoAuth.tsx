import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Shield, User, Mail, Lock, CheckCircle, ArrowRight } from 'lucide-react'

export function DemoAuth() {
  const [currentStep, setCurrentStep] = useState<'signup' | 'signin' | 'dashboard'>('signup')

  const steps = [
    {
      id: 'signup',
      title: '1. Create Account',
      description: 'Sign up with your details',
      icon: User,
      content: (
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <span>Enter your email address</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span>Provide your full name</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <span>Create a strong password</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <span>Confirm your password</span>
          </div>
        </div>
      )
    },
    {
      id: 'signin',
      title: '2. Sign In',
      description: 'Access your account',
      icon: Lock,
      content: (
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <span>Enter your email</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <span>Enter your password</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Get redirected to dashboard</span>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: '3. Start Journaling',
      description: 'Begin your journey',
      icon: Shield,
      content: (
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Welcome to your private space</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Create voice or text entries</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Get AI-powered insights</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Track your progress</span>
          </div>
        </div>
      )
    }
  ]

  return (
    <section className="py-20 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 inline-flex items-center gap-2">
            <Shield className="h-3 w-3" />
            Simple Authentication
          </Badge>
          
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Get started in
            <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              three easy steps
            </span>
          </h2>
          
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Our streamlined authentication process gets you journaling in minutes, 
            with complete privacy and security from the start.
          </p>
        </div>
        
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <Card 
                className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer w-full ${
                  currentStep === step.id ? 'ring-2 ring-primary shadow-lg' : ''
                }`}
                onClick={() => setCurrentStep(step.id as any)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto w-12 h-12 rounded-full p-3 mb-3 transition-colors ${
                    currentStep === step.id ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                  }`}>
                    <step.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                  {currentStep === step.id && (
                    <Badge className="bg-primary text-primary-foreground">
                      Current Step
                    </Badge>
                  )}
                </CardHeader>
                
                <CardContent>
                  {step.content}
                </CardContent>
              </Card>
              
              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center px-4">
                  <div className="bg-background rounded-full p-2 border shadow-sm">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Ready to start your journaling journey?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Badge variant="outline" className="text-sm">
              <Shield className="h-3 w-3 mr-1" />
              End-to-end encrypted
            </Badge>
            <Badge variant="outline" className="text-sm">
              <Shield className="h-3 w-3 mr-1" />
              Zero-knowledge architecture
            </Badge>
            <Badge variant="outline" className="text-sm">
              <Shield className="h-3 w-3 mr-1" />
              GDPR compliant
            </Badge>
          </div>
        </div>
      </div>
    </section>
  )
}
