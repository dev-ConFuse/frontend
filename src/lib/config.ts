/**
 * ConFuse Frontend — API Configuration
 *
 * Post api-backend elimination: service-specific URLs.
 * Each microservice is accessed directly by the frontend.
 *
 * Env-only configuration (see `.cline/rules/env-policy.md`): every URL and
 * tuning value is read directly from env — no hard-coded fallbacks.
 */

export const SERVICE_URLS = {
  auth: process.env.NEXT_PUBLIC_AUTH_URL as string,
  docDataCon: process.env.NEXT_PUBLIC_DOC_DATA_CON_URL as string,
  repoDataCon: process.env.NEXT_PUBLIC_REPO_DATA_CON_URL as string,
  clientConnector: process.env.NEXT_PUBLIC_CLIENT_CONNECTOR_URL as string,
  featureToggle: process.env.NEXT_PUBLIC_FEATURE_TOGGLE_URL as string,
  logDataCon: process.env.NEXT_PUBLIC_LOG_DATA_CON_URL as string,
  logUniProc: process.env.NEXT_PUBLIC_LOG_UNI_PROC_URL as string,
} as const;

/**
 * Server-side (BFF) upstream URLs — used ONLY by code running in Next.js route
 * handlers / server components.
 *
 * `SERVICE_URLS` above holds `NEXT_PUBLIC_*` values, which are baked in at build
 * time and are correct for the **browser** (it reaches services on published
 * ports, e.g. http://localhost:8081). A BFF route runs inside its own container,
 * where "localhost" is the container itself — so it must use the runtime service
 * URLs instead (e.g. http://doc-data-con:8081), which come from the runtime env
 * file and therefore stay correct per environment.
 *
 * Falls back to the browser URL when no server-side variable is set, so local
 * `next dev` outside a container keeps working unchanged.
 */
export const SERVER_URLS = {
  auth: (process.env.AUTH_SERVICE_URL as string) || SERVICE_URLS.auth,
  docDataCon: (process.env.DOC_DATA_CON_URL as string) || SERVICE_URLS.docDataCon,
  repoDataCon: (process.env.REPO_DATA_CON_URL as string) || SERVICE_URLS.repoDataCon,
  logUniProc: (process.env.LOG_UNI_PROC_URL as string) || SERVICE_URLS.logUniProc,
} as const;

/**
 * @deprecated Use SERVICE_URLS instead. Kept for backward compatibility
 * during migration. Maps to data-connector as the default service.
 */
export const API_CONFIG = {
  baseUrl: SERVICE_URLS.docDataCon,
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT as string, 10),
  retries: parseInt(process.env.NEXT_PUBLIC_API_RETRIES as string, 10),
  retryDelay: parseInt(process.env.NEXT_PUBLIC_API_RETRY_DELAY as string, 10),
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
