import { NextRequest, NextResponse } from 'next/server';
import { SERVER_URLS } from '@/lib/config';
import { serverLogger } from '@/lib/server-logger'

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const userIdHeader = request.headers.get('x-user-id');
    // SERVER_URLS, not SERVICE_URLS: this route runs inside the frontend
    // container, where "localhost" is the frontend itself. See lib/config.ts.
    const upstreamUrl = `${SERVER_URLS.docDataCon}/api/documents/upload`;

    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(userIdHeader ? { 'x-user-id': userIdHeader } : {}),
      },
      body: formData,
      cache: 'no-store',
    });

    const contentType = upstreamResponse.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await upstreamResponse.json();
      return NextResponse.json(data, { status: upstreamResponse.status });
    }

    const text = await upstreamResponse.text();
    return NextResponse.json(
      {
        success: upstreamResponse.ok,
        message: text || upstreamResponse.statusText,
      },
      { status: upstreamResponse.status }
    );
  } catch (error) {
    serverLogger.error('Error proxying document upload:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload documents',
      },
      { status: 502 }
    );
  }
}
