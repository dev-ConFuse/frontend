// ============================================================================
// ConFuse Frontend — server-side structured logging (BFF routes + middleware)
//
// Uniform observability contract (mirrors the backend services): structured
// records on stdout with correlation IDs so a request can be traced from the
// browser through the BFF to every downstream service. Redirects, client
// errors and server errors are logged as loudly as successes.
//
// Why a dedicated module: `src/lib/logger.ts` is the browser-side telemetry
// client (buffers + POSTs to /api/telemetry); server code needs synchronous
// stdout records instead. Runs in both the Node and Edge runtimes.
// ============================================================================

export const CORRELATION_HEADER = 'x-correlation-id';

export type ServerLogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<ServerLogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Resolved once at module load (env-policy: required, fail fast at boot — the
// frontend build merges .map.env into the process env via start-build.js, so
// this static reference is inlined and available in the Edge runtime too).
const CONFIGURED_LEVEL = (process.env.LOG_LEVEL ?? '').toLowerCase() as ServerLogLevel;
if (!(CONFIGURED_LEVEL in LEVEL_ORDER)) {
  throw new Error(
    `Missing or invalid required environment variable: LOG_LEVEL (got ${JSON.stringify(process.env.LOG_LEVEL)})`
  );
}

/** Redact secret-looking query values so logs never leak credentials. */
export function sanitizeQuery(query: string | null | undefined): string | undefined {
  if (!query) return undefined;
  return query
    .split('&')
    .map((pair) => {
      const key = pair.split('=')[0].toLowerCase();
      return ['token', 'key', 'secret', 'password', 'auth'].some((needle) => key.includes(needle))
        ? `${pair.split('=')[0]}=[redacted]`
        : pair;
    })
    .join('&');
}

/**
 * Emit one structured log record to stdout.
 *
 * Level comes from LOG_LEVEL (env-policy: required, no baked-in fallback).
 * Records carry `service`, `level`, ISO timestamp and any context fields,
 * matching the JSON shape the Rust/Python services emit.
 */
export function logServerEvent(
  level: ServerLogLevel,
  message: string,
  context: Record<string, unknown> = {}
): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[CONFIGURED_LEVEL]) return;

  const record = {
    timestamp: new Date().toISOString(),
    level,
    service: 'frontend',
    message,
    ...context,
  };
  const line = JSON.stringify(record);
  // stdout is the container log channel (podman logs). Next.js middleware runs
  // in the Edge runtime where process.stdout may be absent — console is the
  // only sink there, so this is a logger transport, not an ad-hoc print.
  if (typeof process !== 'undefined' && process.stdout?.write) {
    process.stdout.write(`${line}\n`);
  } else {
    console.log(line);
  }
}

/** Outcome classification shared with the backend access-log contract. */
export function classifyOutcome(status: number): 'success' | 'redirect' | 'client_error' | 'server_error' {
  if (status < 300) return 'success';
  if (status < 400) return 'redirect';
  if (status < 500) return 'client_error';
  return 'server_error';
}

/**
 * Log one access record for a completed request, at the level implied by its
 * outcome (redirects warn, 4xx warn, 5xx error) so failures are never quieter
 * than successes.
 */
export function logAccess(params: {
  correlationId: string;
  method: string;
  path: string;
  query?: string | undefined;
  status: number;
  durationMs: number;
  location?: string | undefined;
  userAgent?: string | undefined;
}): void {
  const outcome = classifyOutcome(params.status);
  const level: ServerLogLevel =
    outcome === 'server_error' ? 'error' : outcome === 'success' ? 'info' : 'warn';
  logServerEvent(level, `http_access ${params.method} ${params.path} ${params.status}`, {
    ...params,
    outcome,
  });
}

/**
 * Console-compatible shim for BFF code (console.* is banned in production
 * paths by the coding conventions). Accepts the console call shape and folds
 * extra arguments into the record's context so nothing is dropped; Error
 * arguments keep message + stack instead of collapsing to `{}`.
 */
function serializeArgs(args: unknown[]): unknown[] {
  return args.map((arg) =>
    arg instanceof Error
      ? { name: arg.name, message: arg.message, stack: arg.stack }
      : arg
  );
}

export const serverLogger = {
  debug: (message?: unknown, ...args: unknown[]) =>
    logServerEvent('debug', String(message), { args: serializeArgs(args) }),
  info: (message?: unknown, ...args: unknown[]) =>
    logServerEvent('info', String(message), { args: serializeArgs(args) }),
  warn: (message?: unknown, ...args: unknown[]) =>
    logServerEvent('warn', String(message), { args: serializeArgs(args) }),
  error: (message?: unknown, ...args: unknown[]) =>
    logServerEvent('error', String(message), { args: serializeArgs(args) }),
};