import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Mic, ArrowRight, Shield, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export function CTA() {
  return (
    <section className="py-20 sm:py-32 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge variant="secondary" className="mb-6 inline-flex items-center gap-2">
            <Zap className="h-3 w-3" />
            Ready to Start?
          </Badge>
          
          <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Begin your journey of
            <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              self-discovery today
            </span>
          </h2>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Join thousands of users who are already experiencing the benefits of AI-powered journaling 
            with complete privacy and security.
          </p>
          
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Button size="lg" className="group relative overflow-hidden px-8 py-3 text-lg" asChild>
              <Link to="/signup">
                <Mic className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Start Journaling Now
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/20 to-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg" asChild>
              <Link to="/signin">
                <Shield className="mr-2 h-5 w-5" />
                Sign In
              </Link>
            </Button>
          </div>
          
          <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Setup in 2 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
