import type { Metadata } from 'next'
import { PricingPage } from '@/app/billing/components/PricingPage'

export const metadata: Metadata = {
  title: 'ConFuse - Pricing',
  description:
    'Simple, transparent pricing for ConFuse — plans for individual developers, power users, teams and enterprises.',
}

/**
 * Public pricing route (/pricing).
 *
 * SECURITY: intentionally read-only and unauthenticated — it renders the
 * static plan catalogue in PricingPage (no API calls, no user data). Every
 * action behind a plan ("Subscribe"/"Get Started") links to /billing, which
 * gates account operations behind sign-in. This route widens nothing.
 */
export default function PricingRoute() {
  return <PricingPage />
}