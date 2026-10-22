import { NextRequest, NextResponse } from 'next/server'

import {
  CORRELATION_HEADER,
  logServerEvent,
} from '@/lib/server-logger'

/**
 * Provider OAuth callback BFF (GitHub, GitLab, Bitbucket, Slack, Notion,
 * Microsoft, Dropbox).
 *
 * Why: OAuth apps register a frontend Redirect URI
 * (`OAUTH_CALLBACK_URL`, e.g. https://www.confuse.site/api/auth/oauth/callback),
 * so the provider sends the browser here with `code` + `state`. The token
 * exchange itself must run server-side against auth-middleware (it owns the
 * client secrets and stores the connection), authenticated as the signed-in
 * user via the `auth_token` session cookie. This route completes that hop and
 * returns the user to the connectors surface.
 *
 * `state` is issued by auth-middleware's GET /api/auth/oauth/url as
 * `<provider>:<random>` precisely so this callback can recover the provider.
 */
const SUPPORTED_PROVIDERS = new Set([
  'github',
  'gitlab',
  'bitbucket',
  'slack',
  'notion',
  'microsoft',
  'onedrive',
  'dropbox',
])

/** auth-middleware base URL (env-only config — see .cline/rules/env-policy.md). */
function authBaseUrl(): string {
  const url = process.env.AUTH_SERVICE_URL
  if (!url) {
    throw new Error('Missing required environment variable: AUTH_SERVICE_URL')
  }
  return url
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const providerError = searchParams.get('error')
  const providerErrorDescription = searchParams.get('error_description')

  const provider = (state?.split(':')[0] ?? '').toLowerCase()

  const redirectWith = (params: Record<string, string>) => {
    const target = new URL('/connectors', request.url)
    for (const [key, value] of Object.entries(params)) {
      target.searchParams.set(key, value)
    }
    return NextResponse.redirect(target)
  }

  const fail = (message: string) => {
    logServerEvent('warn', 'Provider OAuth callback failed', {
      correlation_id: request.headers.get(CORRELATION_HEADER) ?? undefined,
      provider: provider || 'unknown',
      detail: message,
    })
    return redirectWith({
      error: message,
      ...(provider ? { provider } : {}),
    })
  }

  // 1. Provider-side failure (user denied access, CSRF mismatch, ...)
  if (providerError) {
    return fail(providerErrorDescription || providerError)
  }

  // 2. Basic contract validation
  if (!code) return fail('Missing authorization code')
  if (!SUPPORTED_PROVIDERS.has(provider)) {
    return fail('Unknown OAuth provider in state')
  }

  // 3. The exchange runs as the signed-in user (auth-middleware requireAuth)
  const sessionToken = request.cookies.get('auth_token')?.value
  if (!sessionToken) return fail('Not authenticated')

  const correlationId = request.headers.get(CORRELATION_HEADER) ?? undefined

  let exchangeResponse: Response
  try {
    exchangeResponse = await fetch(`${authBaseUrl()}/api/auth/oauth/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
        ...(correlationId ? { [CORRELATION_HEADER]: correlationId } : {}),
      },
      body: JSON.stringify({ provider, code, state }),
      cache: 'no-store',
    })
  } catch (error) {
    logServerEvent('error', 'Provider OAuth exchange unreachable', {
      correlation_id: correlationId,
      provider,
      detail: error instanceof Error ? error.message : String(error),
    })
    return fail('Could not reach the auth service — please try again')
  }

  if (!exchangeResponse.ok) {
    const body = (await exchangeResponse.json().catch(() => null)) as {
      error?: string
    } | null
    return fail(body?.error ?? `Token exchange failed (${exchangeResponse.status})`)
  }

  logServerEvent('info', 'Provider OAuth connected', {
    correlation_id: correlationId,
    provider,
  })

  return redirectWith({ connected: provider })
}