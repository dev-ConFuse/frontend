import { NextRequest, NextResponse } from 'next/server'
import { logServerEvent } from '@/lib/server-logger'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Values are logged as presence flags only — never the raw code/state
  logServerEvent('info', 'oauth_callback_received', {
    code: code ? 'present' : 'missing',
    state: state ? 'present' : 'missing',
    error,
  })

  // Redirect to page callback with the same parameters
  const redirectUrl = new URL('/auth/callback', request.url)

  if (code) {
    redirectUrl.searchParams.set('code', code)
  }
  if (state) {
    redirectUrl.searchParams.set('state', state)
  }
  if (error) {
    redirectUrl.searchParams.set('error', error)
    logServerEvent('warn', 'oauth_callback_error_forwarded', { error })
  }

  logServerEvent('info', 'oauth_callback_redirecting', {
    location: redirectUrl.pathname,
    outcome: 'redirect',
  })
  return NextResponse.redirect(redirectUrl)
}

export async function POST(request: NextRequest) {
  logServerEvent('debug', 'oauth_callback_post')
  return GET(request)
}
