import { Pool } from 'pg';
import { NEON_CONFIG } from './config';

/**
 * Neon Postgres Client
 * Following neon-postgres skill: Next.js server runtime uses node-postgres (pg.Pool).
 */
const rawUrl = (NEON_CONFIG.databaseUrl || process.env.DATABASE_URL)?.replace(/^"|"$/g, '');

let poolInstance: Pool | null = null;

export function getNeonPool(): Pool | null {
  if (!rawUrl) return null;
  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString: rawUrl.includes('sslmode') ? rawUrl : `${rawUrl}?sslmode=require`,
      ssl: { rejectUnauthorized: false },
    });
  }
  return poolInstance;
}

/**
 * Neon Functions Client
 * Following neon-functions skill: invoke deployed functions on the branch.
 */
export async function invokeNeonFunction(
  functionName: string = 'hello',
  path: string = '/',
  init?: RequestInit
): Promise<{ ok: boolean; status: number; text: string; json?: any }> {
  const branchId = NEON_CONFIG.branchId || process.env.NEON_BRANCH_ID;
  const suffix = NEON_CONFIG.functionHostSuffix || process.env.NEON_FUNCTION_HOST_SUFFIX;

  if (!branchId || !suffix) {
    throw new Error('Neon Functions not configured: missing NEON_BRANCH_ID or NEON_FUNCTION_HOST_SUFFIX');
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `https://${branchId}-${functionName}${suffix}${cleanPath}`;

  const res = await fetch(url, {
    method: 'GET',
    ...init,
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {}

  return {
    ok: res.ok,
    status: res.status,
    text,
    json,
  };
}

/**
 * Neon AI Gateway Client
 * Following neon-ai-gateway skill: OpenAI-compatible endpoint powered by Databricks.
 */
export async function listAiGatewayModels(): Promise<any> {
  const baseUrl = NEON_CONFIG.aiGatewayBaseUrl || process.env.NEON_AI_GATEWAY_BASE_URL;
  const token = NEON_CONFIG.aiGatewayToken || process.env.NEON_AI_GATEWAY_TOKEN;

  if (!baseUrl || !token) {
    throw new Error('Neon AI Gateway not configured: missing NEON_AI_GATEWAY_BASE_URL or NEON_AI_GATEWAY_TOKEN');
  }

  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/v1/models`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`AI Gateway responded with status ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

export async function chatCompletion(params: {
  model?: string;
  messages: Array<{ role: string; content: string }>;
}): Promise<any> {
  const baseUrl = NEON_CONFIG.aiGatewayBaseUrl || process.env.NEON_AI_GATEWAY_BASE_URL;
  const token = NEON_CONFIG.aiGatewayToken || process.env.NEON_AI_GATEWAY_TOKEN;

  if (!baseUrl || !token) {
    throw new Error('Neon AI Gateway not configured: missing NEON_AI_GATEWAY_BASE_URL or NEON_AI_GATEWAY_TOKEN');
  }

  const model = params.model || 'claude-opus-4-8';
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model,
      messages: params.messages,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    return {
      error: `AI Gateway error ${res.status}: ${errorText}`,
      status: res.status,
    };
  }

  return res.json();
}
