import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  CORRELATION_HEADER,
  logAccess,
  logServerEvent,
  sanitizeQuery,
} from '@/lib/server-logger'

// Why: every request crossing the frontend (pages + BFF routes) gets exactly
// one structured access record with outcome classification (success / redirect
// / client_error / server_error), and an x-correlation-id that is forwarded to
// handlers so one request is traceable end to end. (This file is the Next 16
// `proxy` entry point — the successor of `middleware.ts`; only one may exist.)
export function proxy(request: NextRequest) {
  const start = Date.now()
  const incoming = request.headers.get(CORRELATION_HEADER) || request.headers.get('x-request-id')
  const correlationId = incoming ?? crypto.randomUUID()
  const query = sanitizeQuery(request.nextUrl.search.replace(/^\?/, ''))
  const userAgent = request.headers.get('user-agent') ?? undefined

  logServerEvent('debug', 'http_request_started', {
    correlationId,
    method: request.method,
    path: request.nextUrl.pathname,
    query,
    userAgent,
  })

  // Propagate the correlation ID to request handlers (BFF routes, pages)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(CORRELATION_HEADER, correlationId)

  // If the user has an auth token and is trying to access the landing page,
  // immediately redirect them to the dashboard.
  const authToken = request.cookies.get('auth_token')?.value
  if (authToken && request.nextUrl.pathname === '/') {
    const location = '/dashboard'
    logAccess({
      correlationId,
      method: request.method,
      path: request.nextUrl.pathname,
      query,
      status: 307,
      durationMs: Date.now() - start,
      location,
      userAgent,
    })
    return NextResponse.redirect(new URL(location, request.url))
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set(CORRELATION_HEADER, correlationId)

  logAccess({
    correlationId,
    method: request.method,
    path: request.nextUrl.pathname,
    query,
    status: response.status,
    durationMs: Date.now() - start,
    userAgent,
  })

  return response
}

// See "Matching Paths" below to learn more
export const config = {
  // Skip static assets; log all pages and BFF API routes.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
