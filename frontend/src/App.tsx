import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './components/ui/theme-provider'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Features } from './components/Features'
import { Demo } from './components/Demo'
import { DemoAuth } from './components/DemoAuth'
import { Privacy } from './components/Privacy'
import { Pricing } from './components/Pricing'
import { CTA } from './components/CTA'
import { Footer } from './components/Footer'
import { SignUp } from './components/SignUp'
import { SignIn } from './components/SignIn'
import { Dashboard } from './components/Dashboard'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Journals } from './components/Journals'

function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <section id="features">
          <Features />
        </section>
        <Demo />
        <DemoAuth />
        <section id="privacy">
          <Privacy />
        </section>
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/journals" element={
              <ProtectedRoute>
                <Journals />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
