'use client'

import { Navbar } from '@/components/layout/navbar'
import { AuthGuard } from '@/app/auth/components/AuthGuard'
import { useAuth } from '@/contexts/auth'
import { ByodbPanel } from './components/ByodbPanel'

/**
 * Standalone /byodb route — thin shell around the shared ByodbPanel.
 *
 * The panel itself lives in the dashboard "BYODB" tab; this route remains as
 * a deep-link target (e.g. the graph-setup card's fallback navigation).
 */
export default function ByodbPage() {
  const { isAuthenticated } = useAuth()

  return (
    <AuthGuard>
      <div className="dark min-h-screen bg-background text-foreground">
        <Navbar showUserMenu={isAuthenticated} />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <ByodbPanel />
        </main>
      </div>
    </AuthGuard>
  )
}