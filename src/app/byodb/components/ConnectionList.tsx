'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Database, Loader2, RefreshCw, Trash2 } from 'lucide-react'
import {
  DEPLOYMENT_LABELS,
  type FalkorDBConnectionPublic,
} from '@/lib/falkordb'

interface ConnectionListProps {
  connections: FalkorDBConnectionPublic[]
  busyId: string | null
  onRetest: (id: string) => void
  onDelete: (id: string) => void
}

/**
 * Saved customer-owned FalkorDB connections.
 *
 * Secrets are never shown — the API returns `hasPassword` style booleans, and
 * the connection is described only by its non-secret endpoint metadata.
 */
export function ConnectionList({ connections, busyId, onRetest, onDelete }: ConnectionListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Your databases</CardTitle>
        <CardDescription>
          Connections are stored encrypted. Passwords and certificates are never shown again.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {connections.length === 0 ? (
          <div className="flex items-center gap-3 rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
            <Database className="h-5 w-5 shrink-0" aria-hidden="true" />
            No databases connected yet. Add one above to start using your own FalkorDB.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {connections.map((c) => {
              const busy = busyId === c.id
              return (
                <li key={c.id} className="flex flex-wrap items-center gap-3 py-4 first:pt-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">{c.name}</span>
                      {c.deploymentType && (
                        <Badge variant="outline">
                          {DEPLOYMENT_LABELS[c.deploymentType]}
                        </Badge>
                      )}
                      {c.lastTestStatus === 'passed' && (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-600">
                          Verified
                        </Badge>
                      )}
                      {c.lastTestStatus === 'failed' && (
                        <Badge variant="destructive">Last test failed</Badge>
                      )}
                      {c.tlsEnabled && <Badge variant="outline">TLS</Badge>}
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground truncate">
                      <span className="font-mono">{c.host}:{c.port}</span>
                      <span className="mx-1.5">·</span>
                      graph <span className="font-mono">{c.graphName}</span>
                      {c.username && (
                        <>
                          <span className="mx-1.5">·</span>
                          {c.username}
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRetest(c.id)}
                      disabled={busy}
                      title={`Re-test ${c.name}`}
                      aria-label={`Re-test ${c.name}`}
                    >
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(c.id)}
                      disabled={busy}
                      title={`Disconnect ${c.name}`}
                      aria-label={`Disconnect ${c.name}`}
                      className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}