import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ConFuse - URLs',
}

export default function UrlsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
