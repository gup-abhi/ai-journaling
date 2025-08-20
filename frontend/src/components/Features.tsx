import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Mic, Brain, Shield, Lock, TrendingUp, Smartphone, Zap, Eye } from 'lucide-react'

const features = [
  {
    icon: Mic,
    title: "Voice & Text Input",
    description: "Record your thoughts naturally with voice or type them out. Our advanced speech recognition ensures accuracy.",
    badge: "Easy to Use"
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Get intelligent analysis of your journal entries, mood patterns, and personal growth trends.",
    badge: "Smart Analysis"
  },
  {
    icon: Shield,
    title: "Military-Grade Encryption",
    description: "Your data is encrypted end-to-end with AES-256 encryption. Not even we can read your journals.",
    badge: "100% Secure"
  },
  {
    icon: Lock,
    title: "Zero-Knowledge Architecture",
    description: "We never store your encryption keys. Only you have access to your private thoughts.",
    badge: "Privacy First"
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Visualize your emotional journey with beautiful charts and insights about your personal growth.",
    badge: "Growth Insights"
  },
  {
    icon: Smartphone,
    title: "Cross-Platform Sync",
    description: "Access your journals from anywhere. Your encrypted data syncs securely across all devices.",
    badge: "Always Available"
  },
  {
    icon: Zap,
    title: "Real-time Processing",
    description: "Get AI insights instantly as you write. No waiting, no delays, just immediate understanding.",
    badge: "Lightning Fast"
  },
  {
    icon: Eye,
    title: "Personalized Themes",
    description: "Customize your journaling experience with beautiful themes that match your mood and style.",
    badge: "Beautiful Design"
  }
]

export function Features() {
  return (
    <section className="py-20 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need for
            <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              mindful journaling
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Built with privacy, intelligence, and ease of use in mind. Your personal growth journey starts here.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-3">
                <div className="mb-3 rounded-lg bg-primary/10 p-3 w-fit group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="secondary" className="w-fit text-xs">
                  {feature.badge}
                </Badge>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg mb-2">{feature.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
