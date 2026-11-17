import { NextResponse } from 'next/server';
import { getNeonPool, invokeNeonFunction, listAiGatewayModels } from '@/lib/neon';

export async function GET() {
  const results: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    postgres: { ok: boolean; details?: any; error?: string };
    functions: { ok: boolean; details?: any; error?: string };
    aiGateway: { ok: boolean; details?: any; error?: string };
  } = {
    status: 'healthy',
    postgres: { ok: false },
    functions: { ok: false },
    aiGateway: { ok: false },
  };

  // 1. Test Postgres
  try {
    const pool = getNeonPool();
    if (!pool) {
      results.postgres = { ok: false, error: 'DATABASE_URL not configured' };
    } else {
      const client = await pool.connect();
      try {
        const queryRes = await client.query('SELECT 1 as connected, NOW() as server_time');
        const togglesCount = await client.query('SELECT count(*)::int as count FROM feature_toggles.toggles');
        results.postgres = {
          ok: true,
          details: {
            connected: queryRes.rows[0].connected === 1,
            serverTime: queryRes.rows[0].server_time,
            togglesCount: togglesCount.rows[0].count,
          },
        };
      } finally {
        client.release();
      }
    }
  } catch (err: any) {
    results.postgres = { ok: false, error: err.message };
  }

  // 2. Test Neon Functions
  try {
    const fnRes = await invokeNeonFunction('hello');
    results.functions = {
      ok: fnRes.ok,
      details: {
        status: fnRes.status,
        response: fnRes.text,
      },
    };
  } catch (err: any) {
    results.functions = { ok: false, error: err.message };
  }

  // 3. Test Neon AI Gateway
  try {
    const modelsData = await listAiGatewayModels();
    const modelCount = Array.isArray(modelsData?.data) ? modelsData.data.length : 0;
    const sampleModels = Array.isArray(modelsData?.data)
      ? modelsData.data.slice(0, 5).map((m: any) => m.id || m.name)
      : [];
    results.aiGateway = {
      ok: true,
      details: {
        modelCount,
        sampleModels,
      },
    };
  } catch (err: any) {
    results.aiGateway = { ok: false, error: err.message };
  }

  const allOk = results.postgres.ok && results.functions.ok && results.aiGateway.ok;
  const anyOk = results.postgres.ok || results.functions.ok || results.aiGateway.ok;
  results.status = allOk ? 'healthy' : anyOk ? 'degraded' : 'unhealthy';

  return NextResponse.json(results, { status: allOk ? 200 : 207 });
}
