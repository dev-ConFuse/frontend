import { SERVER_URLS } from '@/lib/config';
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

/**
 * BFF proxy for the knowledge-graph storage choice (auth-middleware
 * GET/POST /api/v1/user/graph/setup): no graph is created at signup — the
 * dashboard asks the user to choose between a ConFuse-managed graph and BYODB.
 */
async function proxy(request: NextRequest, method: 'GET' | 'POST') {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const authUrl = SERVER_URLS.auth;
    const body = method === 'POST' ? await request.json().catch(() => ({})) : undefined;

    const res = await fetch(`${authUrl}/api/v1/user/graph/setup`, {
      method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: 'Graph setup unavailable' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return proxy(request, 'GET')
}

export async function POST(request: NextRequest) {
  return proxy(request, 'POST')
}