import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ConFuse - Bring Your Own Database',
  description:
    'Connect your own FalkorDB — your own FalkorDB Cloud account or any self-hosted server — as your ConFuse knowledge store.',
}

export default function ByodbLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}