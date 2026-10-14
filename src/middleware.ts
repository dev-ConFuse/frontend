// ============================================================================
// Next.js middleware — access logging + correlation-ID propagation.
//
// Why: every request crossing the frontend (pages + BFF routes) gets exactly
// one structured access record with outcome classification (success / redirect
// / client_error / server_error), and an x-correlation-id that is forwarded to
// all downstream BFF fetches so one request is traceable end to end.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  CORRELATION_HEADER,
  logAccess,
  logServerEvent,
  sanitizeQuery,
} from '@/lib/server-logger';

export function middleware(request: NextRequest) {
  const start = Date.now();
  const incoming = request.headers.get(CORRELATION_HEADER) || request.headers.get('x-request-id');
  const correlationId = incoming ?? crypto.randomUUID();

  logServerEvent('debug', 'http_request_started', {
    correlationId,
    method: request.method,
    path: request.nextUrl.pathname,
    query: sanitizeQuery(request.nextUrl.search.replace(/^\?/, '')),
    userAgent: request.headers.get('user-agent') ?? undefined,
  });

  // Propagate the correlation ID to the request handlers and BFF fetches
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(CORRELATION_HEADER, correlationId);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(CORRELATION_HEADER, correlationId);

  const durationMs = Date.now() - start;
  logAccess({
    correlationId,
    method: request.method,
    path: request.nextUrl.pathname,
    query: sanitizeQuery(request.nextUrl.search.replace(/^\?/, '')),
    status: response.status,
    durationMs,
    userAgent: request.headers.get('user-agent') ?? undefined,
  });

  return response;
}

export const config = {
  // Skip static assets; log all pages and BFF API routes.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};