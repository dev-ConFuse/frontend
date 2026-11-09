'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Database, Network } from 'lucide-react'
import { useAuth } from '@/contexts/auth'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type GraphMode = 'managed' | 'byodb'

interface GraphSetupState {
  managedGraphExists: boolean
  byodbConnected: boolean
}

/**
 * First-run knowledge-graph choice. Graphs are never provisioned at signup:
 * the user decides between a ConFuse-managed graph and BYODB, and only then
 * is anything created. The server reports what ALREADY exists (accounts
 * provisioned before the choice flow own a graph without a stored choice),
 * so each option is offered at most once: one managed graph AND one BYODB.
 */
interface GraphSetupCardProps {
  /** Switch the dashboard to its BYODB tab instead of navigating away. */
  onByodbSelected?: () => void
}

export function GraphSetupCard({ onByodbSelected }: GraphSetupCardProps) {
  const { token } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [state, setState] = useState<GraphSetupState | null>(null)
  const [busy, setBusy] = useState<GraphMode | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const headers: Record<string, string> = {}
        if (token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch('/api/graph/setup', { headers })
        if (!res.ok) return
        const data = await res.json().catch(() => null)
        if (cancelled) return
        const d = data?.data
        if (d && typeof d.managedGraphExists === 'boolean') {
          setState({
            managedGraphExists: d.managedGraphExists,
            byodbConnected: !!d.byodbConnected,
          })
        }
      } catch {
        // Not signed in / endpoint unavailable — stay hidden.
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [token])

  const choose = async (next: GraphMode) => {
    setBusy(next)
    try {
      const res = await fetch('/api/graph/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode: next }),
      })
      const data = await res.json().catch(() => null)

      if (res.ok && data?.success) {
        const d = data?.data
        setState({
          managedGraphExists: d?.managedGraphExists ?? next === 'managed',
          byodbConnected: d?.byodbConnected ?? false,
        })
        toast({
          title: next === 'managed' ? 'Knowledge graph ready' : 'BYODB selected',
          description:
            next === 'managed'
              ? 'Your ConFuse-managed graph has been created.'
              : 'Connect your own database to start indexing.',
        })
        if (next === 'byodb') {
          // Dashboard hosts BYODB as a tab — prefer in-page switching so the
          // user keeps their workspace context; the standalone route remains
          // only as a deep-link fallback.
          if (onByodbSelected) {
            onByodbSelected()
          } else {
            router.push('/byodb')
          }
        }
        return
      }

      toast({
        title: 'Setup failed',
        description: data?.error || 'Could not save your choice. Please try again.',
        variant: 'destructive',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setBusy(null)
    }
  }

  const showManaged = !state?.managedGraphExists
  const showByodb = !state?.byodbConnected
  if (!state || (!showManaged && !showByodb)) return null

  return (
    <Card className="border-border bg-card mb-6" data-testid="graph-setup-card">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">
          Choose where your knowledge graph lives
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Nothing is created until you decide. Let ConFuse manage a graph for
          you, or bring your own database (BYODB).
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {showManaged && (
          <Button
            className="h-20 flex flex-col gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={busy !== null}
            onClick={() => void choose('managed')}
            data-testid="graph-setup-managed"
          >
            <Network className="h-5 w-5" />
            {busy === 'managed' ? 'Creating…' : 'Create ConFuse Graph'}
          </Button>
        )}
        {showByodb && (
          <Button
            variant="outline"
            className="h-20 flex flex-col gap-2 border-border text-foreground hover:bg-muted"
            disabled={busy !== null}
            onClick={() => void choose('byodb')}
            data-testid="graph-setup-byodb"
          >
            <Database className="h-5 w-5" />
            {busy === 'byodb' ? 'Saving…' : 'Use My Own Database (BYODB)'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}