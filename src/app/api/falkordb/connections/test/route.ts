import { NextRequest, NextResponse } from 'next/server'
import { authClient, unwrapResponse } from '@/lib/api'

/**
 * BFF proxy — test an UNSAVED FalkorDB connection payload.
 * Nothing is persisted by this endpoint; it only runs the verifier.
 *
 *   POST /api/falkordb/connections/test
 */

const UPSTREAM = '/api/v1/falkordb-connections/test'

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization') || request.headers.get('Authorization')
    const userId = request.headers.get('x-user-id')
    const headers: Record<string, string> = {}
    if (auth) headers['Authorization'] = auth
    if (userId) headers['x-user-id'] = userId

    const body = await request.json()
    const resp = await authClient.post(UPSTREAM, body, headers)
    return NextResponse.json({ success: true, data: unwrapResponse(resp) ?? resp })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to test connection' },
      { status: 502 }
    )
  }
}