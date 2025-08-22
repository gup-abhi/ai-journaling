import { Hero } from '../components/Hero'
import { Features } from '../components/Features'
import { Demo } from '../components/Demo'
import { DemoAuth } from '../components/DemoAuth'
import { Privacy } from '../components/Privacy'
import { Pricing } from '../components/Pricing'
import { CTA } from '../components/CTA'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <section id="features">
          <Features />
        </section>
        <section id="demo">
          <Demo />
        </section>
        <section id="demo-auth">
          <DemoAuth />
        </section>
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
