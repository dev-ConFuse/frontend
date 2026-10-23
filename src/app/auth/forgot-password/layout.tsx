import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ConFuse - Forgot Password',
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
