import { SERVER_URLS } from '@/lib/config';
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

/**
 * BFF proxy for the auth-middleware direct tier upgrade
 * (POST /api/v1/billing/upgrade): completes a plan change end to end —
 * persists the new subscription tier server-side and returns the fresh
 * subscription details.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const authUrl = SERVER_URLS.auth;

    const res = await fetch(`${authUrl}/api/v1/billing/upgrade`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upgrade plan' }, { status: 500 });
  }
}