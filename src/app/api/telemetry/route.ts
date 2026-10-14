/**
 * Frontend log ingestion endpoint.
 *
 * The browser logger (lib/logger.ts) flushes buffered logs, performance
 * metrics, and user actions here. Every received record is re-emitted through
 * the structured server logger so browser-side errors, warnings and actions
 * land in the same traceable stream as server logs (level mapped per record).
 */
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { logServerEvent, type ServerLogLevel } from '@/lib/server-logger'

const CLIENT_LEVELS: ServerLogLevel[] = ['debug', 'info', 'warn', 'error']

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    const logs = Array.isArray(payload?.logs) ? payload.logs : []
    const perf = Array.isArray(payload?.performance) ? payload.performance : []
    const actions = Array.isArray(payload?.userActions) ? payload.userActions : []

    for (const entry of logs) {
      const level: ServerLogLevel = CLIENT_LEVELS.includes(entry?.level)
        ? entry.level
        : 'info'
      logServerEvent(level, `client_log ${entry?.message ?? ''}`, {
        source: 'client',
        sessionId: payload?.sessionId,
        traceId: entry?.traceId,
        context: entry?.context,
        url: entry?.url,
      })
    }

    for (const metric of perf) {
      logServerEvent('info', `client_performance ${metric?.metric ?? ''}`, {
        source: 'client',
        sessionId: payload?.sessionId,
        value: metric?.value,
        context: metric?.context,
        url: metric?.url,
      })
    }

    for (const action of actions) {
      logServerEvent('info', `client_action ${action?.action ?? ''}`, {
        source: 'client',
        sessionId: payload?.sessionId,
        element: action?.element,
        context: action?.context,
        url: action?.url,
      })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    // Never let a logging failure break the client — but do record it
    logServerEvent('warn', 'telemetry_ingest_failed', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ success: false }, { status: 200 })
  }
}
