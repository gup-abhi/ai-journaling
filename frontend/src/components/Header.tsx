import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Menu, X, Shield } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { name: 'Features', href: '#features' },
    { name: 'Privacy', href: '#privacy' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="rounded-lg bg-primary p-2">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-foreground">AI Journal</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  Beta
                </Badge>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
            <div className="border-t py-3">
              <Button variant="ghost" className="w-full justify-start" size="sm" asChild>
                <Link to="/signin" onClick={() => setIsMenuOpen(false)}>
                  Sign In
                </Link>
              </Button>
              <Button className="w-full justify-start mt-2" size="sm" asChild>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
