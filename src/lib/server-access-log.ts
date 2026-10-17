// ============================================================================
// ConFuse Frontend — Node-HTTP access logging (one record per request)
//
// Why not src/proxy.ts: Next.js middleware cannot observe the final response
// status (NextResponse.next() always reports 200), so handler-produced 4xx/5xx
// would be misclassified as successes. The Node HTTP request boundary is the
// only place where the true status, duration and Location header are known,
// so the single access record per request is emitted here (see
// .cline/rules/observability.md). Installed from src/instrumentation.ts at
// server start — Node runtime only.
// ============================================================================

import http from 'node:http';
import { randomUUID } from 'node:crypto';

import {
  CORRELATION_HEADER,
  logAccess,
  logServerEvent,
  sanitizeQuery,
} from '@/lib/server-logger';

/** Mirror of the proxy matcher: static assets get no access records. */
const STATIC_ASSET =
  /^\/(?:_next\/static|_next\/image|favicon\.ico)|\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/;

let installed = false;

/**
 * Patch the Node HTTP server so every request produces exactly one access
 * record with the true final status. Correlation IDs are resolved here too
 * (accepted from `x-correlation-id`/`x-request-id`, else generated) and
 * injected into the request + response headers, so the proxy, route handlers
 * and the caller all see the same id.
 */
export function installServerAccessLog(): void {
  if (installed) return;
  installed = true;

  const originalEmit = http.Server.prototype.emit;
  const patchedEmit = function (
    this: http.Server,
    event: string | symbol,
    ...args: unknown[]
  ): boolean {
    if (event === 'request') {
      onRequestStart(args[0] as http.IncomingMessage, args[1] as http.ServerResponse);
    }
    return Reflect.apply(originalEmit, this, [event, ...args]) as boolean;
  };
  http.Server.prototype.emit = patchedEmit as unknown as typeof http.Server.prototype.emit;
}

function onRequestStart(req: http.IncomingMessage, res: http.ServerResponse): void {
  const url = req.url ?? '/';
  const qIndex = url.indexOf('?');
  const path = qIndex === -1 ? url : url.slice(0, qIndex);
  if (STATIC_ASSET.test(path)) return;

  const start = Date.now();
  const incoming = req.headers[CORRELATION_HEADER] ?? req.headers['x-request-id'];
  const correlationId = (typeof incoming === 'string' ? incoming : '') || randomUUID();
  req.headers[CORRELATION_HEADER] = correlationId;
  res.setHeader(CORRELATION_HEADER, correlationId);

  const query = sanitizeQuery(qIndex === -1 ? '' : url.slice(qIndex + 1)) ?? '';
  const client = req.socket.remoteAddress ?? undefined;
  const userAgent = req.headers['user-agent'];

  logServerEvent('debug', 'http_request_started', {
    correlation_id: correlationId,
    method: req.method,
    path,
    query,
    client,
    user_agent: userAgent,
  });

  let logged = false;
  const logCompletion = (): void => {
    if (logged) return;
    logged = true;
    const location = res.getHeader('location');
    logAccess({
      correlationId,
      method: req.method ?? 'GET',
      path,
      query,
      status: res.statusCode,
      durationMs: Date.now() - start,
      location: typeof location === 'string' ? location : undefined,
      client,
      userAgent,
    });
  };
  // 'finish' = response completed; 'close' covers client aborts before finish.
  res.once('finish', logCompletion);
  res.once('close', logCompletion);
}