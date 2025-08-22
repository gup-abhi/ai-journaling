import { Header } from './Header'
import { Hero } from './Hero'
import { Features } from './Features'
import { Demo } from './Demo'
import { DemoAuth } from './DemoAuth'
import { Privacy } from './Privacy'
import { Pricing } from './Pricing'
import { CTA } from './CTA'
import { Footer } from './Footer'

export function LandingPage() {
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
