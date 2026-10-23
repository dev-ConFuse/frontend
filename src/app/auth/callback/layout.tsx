import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ConFuse - Signing In',
}

export default function SigningInLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
