/**
 * ConFuse Frontend — API Configuration
 *
 * Post api-backend elimination: service-specific URLs.
 * Each microservice is accessed directly by the frontend.
 *
 * Env-only configuration (see `.cline/rules/env-policy.md`): every URL and
 * tuning value is required from env — no hard-coded fallbacks. Missing values
 * fail fast naming the variable.
 */

import { requireValue, requireIntValue } from './env';

export const SERVICE_URLS = {
  auth: requireValue('NEXT_PUBLIC_AUTH_URL', process.env.NEXT_PUBLIC_AUTH_URL),
  docDataCon: requireValue('NEXT_PUBLIC_DOC_DATA_CON_URL', process.env.NEXT_PUBLIC_DOC_DATA_CON_URL),
  repoDataCon: requireValue('NEXT_PUBLIC_REPO_DATA_CON_URL', process.env.NEXT_PUBLIC_REPO_DATA_CON_URL),
  clientConnector: requireValue('NEXT_PUBLIC_CLIENT_CONNECTOR_URL', process.env.NEXT_PUBLIC_CLIENT_CONNECTOR_URL),
  featureToggle: requireValue('NEXT_PUBLIC_FEATURE_TOGGLE_URL', process.env.NEXT_PUBLIC_FEATURE_TOGGLE_URL),
  logDataCon: requireValue('NEXT_PUBLIC_LOG_DATA_CON_URL', process.env.NEXT_PUBLIC_LOG_DATA_CON_URL),
  logUniProc: requireValue('NEXT_PUBLIC_LOG_UNI_PROC_URL', process.env.NEXT_PUBLIC_LOG_UNI_PROC_URL),
} as const;

/**
 * @deprecated Use SERVICE_URLS instead. Kept for backward compatibility
 * during migration. Maps to data-connector as the default service.
 */
export const API_CONFIG = {
  baseUrl: SERVICE_URLS.docDataCon,
  timeout: requireIntValue('NEXT_PUBLIC_API_TIMEOUT', process.env.NEXT_PUBLIC_API_TIMEOUT),
  retries: requireIntValue('NEXT_PUBLIC_API_RETRIES', process.env.NEXT_PUBLIC_API_RETRIES),
  retryDelay: requireIntValue('NEXT_PUBLIC_API_RETRY_DELAY', process.env.NEXT_PUBLIC_API_RETRY_DELAY),
} as const;

export const ENDPOINTS = {
  health: '/health',
  urls: '/api/urls',
  documents: '/api/documents',
  settings: '/api/settings',
} as const;


if (typeof window !== 'undefined') {
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Validate all service URLs
  Object.entries(SERVICE_URLS).forEach(([name, url]) => {
    if (!url) {
      console.error(`Missing ${name} service URL`);
    } else if (!isValidUrl(url)) {
      console.error(`Invalid ${name} service URL:`, url);
    }
  });
}

export default API_CONFIG;
