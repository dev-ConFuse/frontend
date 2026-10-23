import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ConFuse - Connectors',
}

export default function ConnectorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
