import { SERVER_URLS } from '@/lib/config';
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const authUrl = SERVER_URLS.auth;

    if (authHeader) {
      const res = await fetch(`${authUrl}/api/v1/billing/portal`, {
        method: 'POST',
        headers: { 'Authorization': authHeader },
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    }

    return NextResponse.json({
      success: true,
      data: { portalUrl: '/billing' }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customer portal' }, { status: 500 });
  }
}
