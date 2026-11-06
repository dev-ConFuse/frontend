'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/auth'
import { Button } from '@/components/ui/button'

/**
 * Global marketing/navigation bar.
 *
 * `showUserMenu` renders the authenticated user controls; `showAuth` gates the
 * whole auth area (Sign In included) for surfaces like docs that keep a
 * navigation-only bar. Every other page keeps the default behaviour.
 */
export function Navbar({ showUserMenu = true, showAuth = true }: { showUserMenu?: boolean; showAuth?: boolean }) {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } =
    useAuth()

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur"
      data-testid="navbar"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2"
          data-testid="navbar-brand"
        >
          <span className="text-xl font-bold text-foreground">ConFuse</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" data-testid="navbar-links">
          <Link
            href="/#features"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            data-testid="navbar-features"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            data-testid="navbar-pricing"
          >
            Pricing
          </Link>
          <Link
            href="/docs"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            data-testid="navbar-docs"
          >
            Documentation
          </Link>
        </nav>

        <div className="flex items-center gap-3" data-testid="navbar-actions">
          {showAuth &&
            (showUserMenu && isAuthenticated ? (
              <>
                <span
                  className="hidden max-w-[160px] truncate text-sm text-muted-foreground sm:block"
                  data-testid="navbar-user"
                >
                  {user?.name || user?.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  data-testid="navbar-sign-out"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                {!isLoading && !isAuthenticated ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      window.location.href = '/auth/login'
                    }}
                    data-testid="navbar-sign-in"
                  >
                    Sign In
                  </Button>
                ) : null}
              </>
            ))}
        </div>
      </div>
    </header>
  )
}