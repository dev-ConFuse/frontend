'use client'

import { useAuth } from '@/contexts/auth'
import { Button } from '@/components/ui/button'

/**
 * Landing-page hero: value proposition and primary conversion CTAs.
 * CTAs trigger the Auth0 redirect flow (no local credential form).
 */
export function HeroSection() {
  const { loginWithRedirect } = useAuth()

  return (
    <section
      className="relative overflow-hidden px-4 pb-16 pt-24 sm:px-6 lg:px-8"
      data-testid="hero-section"
    >
      <div className="mx-auto max-w-4xl text-center">
        <p
          className="mb-4 text-sm font-medium uppercase tracking-widest text-primary"
          data-testid="hero-eyebrow"
        >
          ConFuse Platform
        </p>
        <h1
          className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl"
          data-testid="hero-heading"
        >
          AI-powered repository unification for microservices
        </h1>
        <p
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          data-testid="hero-subheading"
        >
          Unify your repositories and documentation into a single knowledge
          graph. Ingest code and documents, build semantic understanding, and
          expose it to your team and AI agents through one platform.
        </p>

        <div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          data-testid="hero-actions"
        >
          <Button
            size="lg"
            onClick={() => void loginWithRedirect()}
            data-testid="hero-get-started"
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            size="lg"
            asChild
            data-testid="hero-learn-more"
          >
            <a href="#features">Learn More</a>
          </Button>
        </div>
      </div>
    </section>
  )
}