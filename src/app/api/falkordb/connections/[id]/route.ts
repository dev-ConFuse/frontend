import { NextRequest, NextResponse } from 'next/server'
import { authClient, unwrapResponse } from '@/lib/api'

/**
 * BFF proxy for a single customer-owned FalkorDB connection.
 *
 *   GET    /api/falkordb/connections/:id   → one connection (public DTO)
 *   DELETE /api/falkordb/connections/:id   → delete + purge its secrets
 */

function upstream(id: string): string {
  return `/api/v1/falkordb-connections/${encodeURIComponent(id)}`
}

function forwardHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {}
  const auth = request.headers.get('authorization') || request.headers.get('Authorization')
  const userId = request.headers.get('x-user-id')
  if (auth) headers['Authorization'] = auth
  if (userId) headers['x-user-id'] = userId
  return headers
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const resp = await authClient.get(upstream(id), forwardHeaders(request))
    return NextResponse.json({ success: true, data: unwrapResponse(resp) ?? resp })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to load connection' },
      { status: 502 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const resp = await authClient.delete(upstream(id), forwardHeaders(request))
    return NextResponse.json({ success: true, data: unwrapResponse(resp) ?? resp })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete connection' },
      { status: 502 }
    )
  }
}