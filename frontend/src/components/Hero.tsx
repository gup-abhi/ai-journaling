import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Mic, PenTool, Shield, Brain } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 inline-flex items-center gap-2">
            <Shield className="h-3 w-3" />
            End-to-End Encrypted
          </Badge>
          
          {/* Main Headline */}
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Your Private AI
            <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Journaling Companion
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Record your thoughts with voice or text, get AI-powered insights, and keep everything 
            secure with military-grade encryption. Your privacy is our priority.
          </p>
          
          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Button size="lg" className="group relative overflow-hidden" asChild>
              <Link to="/signup">
                <Mic className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Start Journaling
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/20 to-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/signin">
                <PenTool className="mr-2 h-5 w-5" />
                Sign In
              </Link>
            </Button>
          </div>
          
          {/* Feature Highlights */}
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 rounded-full bg-primary/10 p-3">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Voice & Text</h3>
              <p className="text-sm text-muted-foreground">Multiple input methods</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 rounded-full bg-primary/10 p-3">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">AI Insights</h3>
              <p className="text-sm text-muted-foreground">Smart analysis & patterns</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 rounded-full bg-primary/10 p-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">100% Private</h3>
              <p className="text-sm text-muted-foreground">End-to-end encrypted</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-1/4 top-1/4 h-[300px] w-[300px] rounded-full bg-primary/5 blur-3xl" />
      </div>
    </section>
  )
}
