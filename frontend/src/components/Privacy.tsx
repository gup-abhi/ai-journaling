import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Shield, Lock, EyeOff, Key, Database, CheckCircle } from 'lucide-react'

const securityFeatures = [
  {
    icon: Shield,
    title: "AES-256 Encryption",
    description: "Military-grade encryption that protects your data both in transit and at rest.",
    status: "Active"
  },
  {
    icon: Lock,
    title: "Zero-Knowledge Architecture",
    description: "We cannot access your encrypted data. Only you hold the keys to your thoughts.",
    status: "Verified"
  },
  {
    icon: EyeOff,
    title: "No Data Mining",
    description: "We never analyze your content for advertising or any other purpose.",
    status: "Guaranteed"
  },
  {
    icon: Key,
    title: "Client-Side Encryption",
    description: "Your data is encrypted before it leaves your device, ensuring complete privacy.",
    status: "Active"
  },
  {
    icon: Database,
    title: "Secure Storage",
    description: "All data is stored in encrypted databases with multiple security layers.",
    status: "Protected"
  },
  {
    icon: CheckCircle,
    title: "GDPR Compliant",
    description: "Full compliance with international privacy regulations and standards.",
    status: "Certified"
  }
]

export function Privacy() {
  return (
    <section className="py-20 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div>
            <Badge variant="outline" className="mb-4 inline-flex items-center gap-2">
              <Shield className="h-3 w-3" />
              Privacy First
            </Badge>
            
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
              Your privacy is
              <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                non-negotiable
              </span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              We believe your thoughts are sacred. That's why we've built the most secure journaling platform 
              available, with end-to-end encryption that ensures your private thoughts remain private forever.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">No Backdoors</h4>
                  <p className="text-sm text-muted-foreground">We cannot access your encrypted data, even if requested by authorities.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">Open Source Security</h4>
                  <p className="text-sm text-muted-foreground">Our encryption methods are transparent and auditable by security experts.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">Regular Audits</h4>
                  <p className="text-sm text-muted-foreground">Independent security firms regularly audit our systems and practices.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Security Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="group hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="mb-3 rounded-lg bg-primary/10 p-2 w-fit group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary" className="w-fit text-xs">
                    {feature.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
