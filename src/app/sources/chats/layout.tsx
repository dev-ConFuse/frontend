import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ConFuse - Chats',
}

export default function ChatsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
