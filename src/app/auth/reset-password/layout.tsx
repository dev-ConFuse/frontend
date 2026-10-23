import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ConFuse - Reset Password',
}

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
