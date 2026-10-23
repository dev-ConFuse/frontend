import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ConFuse - Rulesets',
}

export default function RulesetsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
