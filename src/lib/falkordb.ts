/**
 * ConFuse Frontend — BYODB (Bring Your Own Database) client
 *
 * Thin typed wrapper over auth-middleware's customer-owned FalkorDB
 * connection API (`/api/v1/falkordb-connections`).
 *
 * The backend treats FalkorDB Cloud, self-hosted and BYOC as ONE model:
 * authentication and connectivity never depend on the deployment type.
 * `deploymentType` is metadata for reporting/UI only. The only practical
 * difference in the UI is that Cloud users paste a connection string while
 * self-hosted users fill discrete fields — both land in the same payload.
 *
 * Secret rules mirrored from auth-middleware:
 *   - `password` / `caCertificate` / `clientCertificate` / `clientKey` are
 *     write-only. They are never echoed back — the API returns `hasPassword`
 *     style booleans instead.
 *   - Verification happens BEFORE persistence; `allowUnverified` opts out.
 */

// ============================================================================
// Types — mirror `auth-middleware/src/types/falkordb.ts`
// ============================================================================

export type FalkorDbTopology = 'standalone' | 'sentinel' | 'cluster';

export type FalkorDbDeploymentType = 'cloud' | 'self_hosted' | 'byoc' | 'unknown';

export type FalkorDbTestStatus = 'passed' | 'failed';

/** Write-only payload used to create/update a connection or run an unsaved test. */
export interface FalkorDbConnectionInput {
  name?: string;

  /** Convenience form: `falkor://` `falkors://` `redis://` `rediss://host:port`. */
  connectionUrl?: string;

  host?: string;
  port?: number;

  username?: string;
  /** Write-only. Stored encrypted server-side, never returned. */
  password?: string;

  /** Required — there is no ambient default graph. */
  graphName?: string;

  tlsEnabled?: boolean;

  /** Write-only PEM material. */
  caCertificate?: string;
  clientCertificate?: string;
  clientKey?: string;

  topology?: FalkorDbTopology;
  deploymentType?: FalkorDbDeploymentType;
  sentinelMasterName?: string;

  clearPassword?: boolean;
  clearCaCertificate?: boolean;
  clearClientCertificate?: boolean;
  clearClientKey?: boolean;

  /** Save even if verification fails (e.g. allowlist not open yet). Default false. */
  allowUnverified?: boolean;
}

/** Safe representation returned by the API — secrets become booleans. */
export interface FalkorDbConnectionPublic {
  id: string;
  customerId: string;
  name: string;
  host: string;
  port: number;
  username?: string;
  hasPassword: boolean;
  graphName: string;
  tlsEnabled: boolean;
  hasCaCertificate: boolean;
  hasClientCertificate: boolean;
  hasClientKey: boolean;
  topology?: FalkorDbTopology;
  deploymentType?: FalkorDbDeploymentType;
  sentinelMasterName?: string;
  status: 'active' | 'disabled';
  lastTestedAt?: string | null;
  lastTestStatus?: FalkorDbTestStatus | null;
  createdAt: string;
  updatedAt: string;
}

export type FalkorDbTestStepName =
  | 'connect'
  | 'authenticate'
  | 'ping'
  | 'falkordb'
  | 'graph';

export interface FalkorDbTestStep {
  name: FalkorDbTestStepName;
  ok: boolean;
  message: string;
  durationMs: number;
}

export type FalkorDbErrorCode =
  | 'INVALID_CONFIG'
  | 'DNS_FAILURE'
  | 'CONNECTION_REFUSED'
  | 'NETWORK_UNREACHABLE'
  | 'TCP_TIMEOUT'
  | 'TLS_ERROR'
  | 'AUTH_FAILED'
  | 'ACL_DENIED'
  | 'NOT_FALKORDB'
  | 'GRAPH_ERROR'
  | 'SECRET_ERROR'
  | 'UNKNOWN';

export interface FalkorDbTestError {
  code: FalkorDbErrorCode;
  /** Redacted, safe-to-display. Never contains secrets. */
  message: string;
  hints: string[];
}

export interface FalkorDbConnectionTestResult {
  success: boolean;
  steps: FalkorDbTestStep[];
  server?: {
    version?: string;
    graphCount?: number;
  };
  graph?: {
    name: string;
    exists: boolean;
  };
  error?: FalkorDbTestError;
  durationMs: number;
}

// ============================================================================
// HTTP — via the Next.js BFF so the service URL stays server-side
// ============================================================================

const BASE = '/api/falkordb/connections';

interface BffBody {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
}

/**
 * Resolve the auth token exactly the way `lib/api.ts`'s `getAuthHeaders` does,
 * so BYODB calls carry the same credential as every other authenticated call
 * in the app. Callers may still pass a token explicitly to override.
 */
function resolveToken(explicit?: string): string {
  if (explicit) return explicit;
  if (typeof window === 'undefined') return '';
  try {
    return (
      localStorage.getItem('confuse_token') ||
      localStorage.getItem('auth0_token') ||
      ''
    );
  } catch {
    // localStorage can throw in private-mode / sandboxed iframes.
    return '';
  }
}

/**
 * Call the BFF proxy. We deliberately do NOT use `authClient` here: these are
 * same-origin Next.js routes, so the Auth0 access token is forwarded by the
 * caller and the browser never talks to auth-middleware directly.
 */
async function callBff<T>(
  path: string,
  init: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, headers, ...rest } = init;

  const response = await fetch(`${BASE}${path}`, {
    ...rest,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string> | undefined),
    },
  });

  let payload: BffBody & T;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Unexpected response from the server (${response.status})`);
  }

  if (!response.ok || payload.success === false) {
    throw new Error(payload.error || payload.message || `Request failed (${response.status})`);
  }

  // The BFF wraps upstream bodies as { success, data }. Unwrap so callers
  // read the upstream shape directly ({ connections } / { testResult } / …).
  return (payload.data as T) ?? (payload as T);
}

/** Build the write-only payload, dropping empty values so the backend
 *  treats them as "unchanged" rather than "cleared". */
function toPayload(input: FalkorDbConnectionInput): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null || value === '') continue;
    payload[key] = value;
  }
  return payload;
}

// ============================================================================
// Public operations
// ============================================================================

export async function listFalkorDbConnections(token?: string): Promise<FalkorDbConnectionPublic[]> {
  const res = await callBff<{ connections: FalkorDbConnectionPublic[] }>('', {
    token: resolveToken(token),
  });
  return res.connections ?? [];
}

export async function testFalkorDbConnection(
  input: FalkorDbConnectionInput,
  token?: string
): Promise<FalkorDbConnectionTestResult> {
  const res = await callBff<{ testResult: FalkorDbConnectionTestResult }>('/test', {
    method: 'POST',
    token: resolveToken(token),
    body: JSON.stringify(toPayload(input)),
  });
  return res.testResult;
}

export async function createFalkorDbConnection(
  input: FalkorDbConnectionInput,
  token?: string
): Promise<FalkorDbConnectionPublic> {
  const res = await callBff<{ connection: FalkorDbConnectionPublic }>('', {
    method: 'POST',
    token: resolveToken(token),
    body: JSON.stringify(toPayload(input)),
  });
  return res.connection;
}

export async function deleteFalkorDbConnection(id: string, token?: string): Promise<void> {
  await callBff<{ success: boolean }>(`/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    token: resolveToken(token),
  });
}

export async function testSavedFalkorDbConnection(
  id: string,
  token?: string
): Promise<FalkorDbConnectionTestResult> {
  const res = await callBff<{ testResult: FalkorDbConnectionTestResult }>(
    `/${encodeURIComponent(id)}/test`,
    { method: 'POST', token: resolveToken(token) }
  );
  return res.testResult;
}

// ============================================================================
// Presentation helpers
// ============================================================================

/** Human label for a verifier step. */
export const STEP_LABELS: Record<FalkorDbTestStepName, string> = {
  connect: 'TCP connect',
  authenticate: 'Authenticate',
  ping: 'PING',
  falkordb: 'FalkorDB module',
  graph: 'Graph access',
};

/** Human label for a deployment type. */
export const DEPLOYMENT_LABELS: Record<FalkorDbDeploymentType, string> = {
  cloud: 'FalkorDB Cloud',
  self_hosted: 'Self-hosted',
  byoc: 'BYOC',
  unknown: 'Unknown',
};

/** Actionable hint text for the error codes the backend classifies. */
export const ERROR_HINTS: Partial<Record<FalkorDbErrorCode, string>> = {
  DNS_FAILURE: 'Check the hostname for typos and confirm it resolves publicly.',
  CONNECTION_REFUSED: 'The host is reachable but nothing answered on that port.',
  TCP_TIMEOUT: 'A firewall or security group is most likely blocking the port.',
  TLS_ERROR: 'TLS may be disabled on the server — try turning TLS off, or supply a CA certificate.',
  AUTH_FAILED: 'Double-check the username and password. FalkorDB Cloud uses the password as the only credential.',
  NOT_FALKORDB: 'That endpoint answered, but it is not FalkorDB (is the FalkorDB module loaded?).',
  GRAPH_ERROR: 'Connected fine, but the graph could not be opened. The name is created on first write.',
};