'use client'

import Link from 'next/link'

/**
 * Site footer for the public landing surface.
 */
export function Footer() {
  return (
    <footer
      className="border-t border-border bg-background px-4 py-10 sm:px-6 lg:px-8"
      data-testid="footer"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">ConFuse</span>
          <span className="text-sm text-muted-foreground">
            AI-powered repository unification
          </span>
        </div>

        <nav className="flex items-center gap-6" data-testid="footer-links">
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <a
            href="#features"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </a>
        </nav>

        <p className="text-sm text-muted-foreground" data-testid="footer-copyright">
          © {new Date().getFullYear()} ConFuse. All rights reserved.
        </p>
      </div>
    </footer>
  )
}