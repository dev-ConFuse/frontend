import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ConFuse - Design',
}

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
