'use client'

import { ThemeProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { LoggingProvider } from "@/components/providers/LoggingProvider"
import { AuthProvider } from "@/contexts/auth"
import { ToggleProvider } from "@/contexts/toggle"
import Auth0ProviderWithNavigate from "@/components/Auth0ProviderWithNavigate"

function AuthLoggingWrapper({ children }: { children: React.ReactNode }) {
  // Use Auth0 SDK for logging provider
  const { user } = useAuth0()

  return (
    <LoggingProvider userId={user?.sub}>
      {children}
    </LoggingProvider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  // One QueryClient for the app, tuned for a dashboard that polls on every
  // screen. React Query's stock defaults (staleTime: 0, retry: 3,
  // refetchOnWindowFocus: true) mean every component mount and every
  // window-focus fired a fresh round of backend calls — which is why "many
  // operations take long" even though each backend answers in tens of ms.
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Fresh for 30s: remounting a panel reuses the cache instead of
        // re-hitting the API. Still short enough to feel live.
        staleTime: 30_000,
        // Keep unmounted data around briefly so back/forward is instant.
        gcTime: 5 * 60_000,
        // One retry only. A hung upstream must fail fast rather than be
        // retried 3x, each with exponential backoff.
        retry: 1,
        // Switching tabs/windows must not trigger a refetch storm.
        refetchOnWindowFocus: false,
        // Reconnects should refresh — data may have changed while offline.
        refetchOnReconnect: true,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Auth0ProviderWithNavigate>
          <AuthProvider>
            <ToggleProvider>
              <AuthLoggingWrapper>
                {children}
              </AuthLoggingWrapper>
            </ToggleProvider>
          </AuthProvider>
        </Auth0ProviderWithNavigate>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
