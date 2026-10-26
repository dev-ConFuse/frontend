import { NextRequest, NextResponse } from 'next/server'
import { authClient, unwrapResponse } from '@/lib/api'

/**
 * BFF proxy for auth-middleware's customer-owned FalkorDB connections.
 *
 * The browser talks only to Next.js; the auth-middleware URL stays server-side
 * (see `SERVER_URLS.auth` in lib/config.ts). We forward the caller's bearer
 * token and let auth-middleware own authentication — this route adds no auth
 * of its own beyond passing credentials through.
 *
 *   GET  /api/falkordb/connections        → list connections (public DTOs)
 *   POST /api/falkordb/connections        → verify + create
 */

const UPSTREAM = '/api/v1/falkordb-connections'

function forwardHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {}
  const auth = request.headers.get('authorization') || request.headers.get('Authorization')
  const userId = request.headers.get('x-user-id')
  if (auth) headers['Authorization'] = auth
  if (userId) headers['x-user-id'] = userId
  return headers
}

export async function GET(request: NextRequest) {
  try {
    const resp = await authClient.get(UPSTREAM, forwardHeaders(request))
    return NextResponse.json({ success: true, data: unwrapResponse(resp) ?? resp })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to load connections' },
      { status: 502 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const resp = await authClient.post(UPSTREAM, body, forwardHeaders(request))
    return NextResponse.json({ success: true, data: unwrapResponse(resp) ?? resp })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create connection' },
      { status: 502 }
    )
  }
}