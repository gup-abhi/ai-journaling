import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Check, Crown, Zap } from 'lucide-react'

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with journaling",
    features: [
      "Unlimited journal entries",
      "Basic AI insights",
      "Voice & text input",
      "End-to-end encryption",
      "Basic themes",
      "Mobile & web access"
    ],
    cta: "Get Started Free",
    popular: false
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    description: "Advanced features for serious journalers",
    features: [
      "Everything in Free",
      "Advanced AI insights",
      "Mood tracking & analytics",
      "Custom themes",
      "Export & backup",
      "Priority support",
      "Advanced privacy controls"
    ],
    cta: "Start Pro Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    description: "For teams and organizations",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Admin dashboard",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantees",
      "Custom security features"
    ],
    cta: "Contact Sales",
    popular: false
  }
]

export function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 inline-flex items-center gap-2">
            <Crown className="h-3 w-3" />
            Simple Pricing
          </Badge>
          
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Choose the plan that
            <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              fits your journey
            </span>
          </h2>
          
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade when you're ready. All plans include our core privacy and security features.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                plan.popular ? 'ring-2 ring-primary shadow-lg' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Zap className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
                <CardDescription className="text-base mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full mt-6 ${
                    plan.popular 
                      ? 'bg-primary hover:bg-primary/90' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            All plans include our core security features:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              End-to-end encryption
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Zero-knowledge architecture
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              GDPR compliant
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Regular security audits
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
