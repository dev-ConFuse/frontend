import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ConFuse - Documents',
}

export default function DocumentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
