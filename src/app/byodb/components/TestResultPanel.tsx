'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, AlertTriangle, Server, GitBranch } from 'lucide-react'
import {
  ERROR_HINTS,
  STEP_LABELS,
  type FalkorDBConnectionTestResult,
  type FalkorDBTestStep,
} from '@/lib/falkordb'

function StepRow({ step }: { step: FalkorDBTestStep }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5">
        {step.ok ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{STEP_LABELS[step.name]}</span>
          <span className="text-xs tabular-nums text-muted-foreground">{step.durationMs}ms</span>
        </div>
        <p className="text-xs text-muted-foreground truncate" title={step.message}>
          {step.message}
        </p>
      </div>
    </div>
  )
}

/**
 * Readout for a FalkorDB connection verification run.
 *
 * Renders the verifier's ordered steps (TCP connect → authenticate → PING →
 * FalkorDB module → graph access) so a failure is attributable to exactly one
 * layer rather than reported as a generic "connection failed".
 */
export function TestResultPanel({ result }: { result: FalkorDBConnectionTestResult }) {
  const hint = result.error ? ERROR_HINTS[result.error.code] : undefined

  return (
    <Card className={result.success ? 'border-green-500/40' : 'border-red-500/40'}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">
            {result.success ? 'Connection verified' : 'Connection failed'}
          </CardTitle>
          <Badge variant={result.success ? 'default' : 'destructive'}>
            {result.durationMs}ms
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        <div className="divide-y divide-border">
          {result.steps.map((step) => (
            <StepRow key={step.name} step={step} />
          ))}
        </div>

        {result.server && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {result.server.version && (
              <span className="inline-flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5" aria-hidden="true" />
                FalkorDB {result.server.version}
              </span>
            )}
            {typeof result.server.graphCount === 'number' && (
              <span>{result.server.graphCount} graph(s) on server</span>
            )}
            {result.graph && (
              <span className="inline-flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="font-mono">{result.graph.name}</span>
                <span>
                  {result.graph.exists ? '(existing)' : '(will be created on first write)'}
                </span>
              </span>
            )}
          </div>
        )}

        {result.error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" aria-hidden="true" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-red-500">
                    {result.error.code}
                  </span>
                </div>
                <p className="text-sm text-foreground">{result.error.message}</p>
              </div>
            </div>

            {(hint || result.error.hints?.length > 0) && (
              <ul className="list-disc list-inside space-y-1 pl-6 text-xs text-muted-foreground">
                {result.error.hints?.map((h) => <li key={h}>{h}</li>)}
                {hint && !result.error.hints?.includes(hint) && <li>{hint}</li>}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}