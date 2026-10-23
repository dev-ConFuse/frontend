import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ConFuse - Repositories',
}

export default function RepositoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
