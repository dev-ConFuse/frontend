import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ConFuse- Login/SignUp',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
