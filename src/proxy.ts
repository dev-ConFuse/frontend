import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { CORRELATION_HEADER } from '@/lib/server-logger'

// Why: correlation propagation to handlers + the landing-page auth redirect.
// Access records are emitted at the Node HTTP layer
// (src/lib/server-access-log.ts) where the final response status is visible —
// Next middleware always sees 200 for pass-throughs, so it must not classify
// outcomes itself. (This file is the Next 16 `proxy` entry point — the
// successor of `middleware.ts`; only one may exist.)
export function proxy(request: NextRequest) {
  const incoming = request.headers.get(CORRELATION_HEADER) || request.headers.get('x-request-id')
  const correlationId = incoming ?? crypto.randomUUID()

  // Propagate the correlation ID to request handlers (BFF routes, pages)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(CORRELATION_HEADER, correlationId)

  // If the user has an auth token and is trying to access the landing page,
  // immediately redirect them to the dashboard.
  const authToken = request.cookies.get('auth_token')?.value
  if (authToken && request.nextUrl.pathname === '/') {
    const redirect = NextResponse.redirect(new URL('/dashboard', request.url))
    redirect.headers.set(CORRELATION_HEADER, correlationId)
    return redirect
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
}

// See "Matching Paths" below to learn more
export const config = {
  // Skip static assets; pages and BFF API routes pass through for correlation.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
