import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
// import logo from '@/assets/logo.svg' // if it's inside src/assets

export function Header() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { signOut, isAuthenticated, user } = useAuthStore()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const navigation = isAuthenticated
    ? [
        { name: 'Dashboard', href: '/dashboard', tag: Link },
        { name: 'Journals', href: '/journals', tag: Link },
        { name: 'Trends', href: '/trends', tag: Link },
        { name: 'Goals', href: '/goals', tag: Link },
      ]
    : [
        { name: 'Features', href: '#features', tag: 'a' },
        { name: 'Privacy', href: '/#privacy', tag: 'a' },
        { name: 'Pricing', href: '/#pricing', tag: 'a' },
        { name: 'About', href: '/#about', tag: 'a' },
      ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="rounded-lg bg-primary p-2">
                <img
                  src="logo.svg" // change if in assets → {logo}
                  alt="AI Journal Logo"
                  className="h-6 w-6"
                />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-foreground">AI Journal</span>
                {isAuthenticated ? (
                  <p className="text-xs text-muted-foreground">
                    Welcome, { user?.user_metadata.display_name || user?.user_metadata.full_name }!
                  </p>
                ) : (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Beta
                  </Badge>
                )}
              </div>
            </Link>
          </div>

          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="rounded-lg bg-primary p-2">
                <img
                  src="/logo.svg" // change if in assets → {logo}
                  alt="AI Journal Logo"
                  className="h-6 w-6"
                />
              </div>
              <div>
                <span className="text-xl font-bold text-foreground">AI Journal</span>
                {isAuthenticated ? (
                  <p className="text-xs text-muted-foreground">
                    Welcome, {user?.user_metadata.display_name || user?.user_metadata.full_name}!
                  </p>
                ) : (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Beta
                  </Badge>
                )}
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) =>
              item.tag === Link ? (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    isActive
                      ? "text-accent font-bold" // active style
                      : "text-muted-foreground hover:text-foreground transition-colors" // default
                  }
                >
                  {item.name}
                </NavLink>
              ) : (
                <a key={item.name} href={item.href}>
                  {item.name}
                </a>
              )
            )}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <Button size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/sign-in">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/sign-up">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 pb-3 pt-2 px-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 text-base font-medium hover:bg-accent hover:text-foreground ${
                      isActive ? "text-accent font-bold" : "text-muted-foreground"
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
            <div className="border-t py-3">
              {isAuthenticated ? (
                <Button
                  size="sm"
                  className="w-full justify-start"
                  onClick={async () => {
                    await signOut()
                    setIsMenuOpen(false)
                  }}
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button variant="ghost" className="w-full justify-start" size="sm" asChild>
                    <Link to="/sign-in" onClick={() => setIsMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button className="w-full justify-start mt-2" size="sm" asChild>
                    <Link to="/sign-up" onClick={() => setIsMenuOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
