// Why: env-policy requires required configuration to fail fast at boot. The
// logging level lives in server-logger.ts, which resolves it lazily so that
// `next build`'s page-data collection (inside the builder image, where runtime
// env is absent) doesn't crash. Next.js calls register() exactly once when the
// server instance starts — the boot moment — so the validation runs before any
// request is served. See https://nextjs.org/docs/app/guides/instrumentation
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const dns = await import('dns');
      const origLookup = dns.lookup;
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      dns.lookup = (h: string, o: any, cb: any) => {
        if (typeof o === 'function') {
          cb = o;
          o = {};
        }
        dns.resolve4(h, (err, addrs) => {
          if (!err && addrs && addrs.length) {
            return o && o.all ? cb(null, addrs.map((a: string) => ({ address: a, family: 4 }))) : cb(null, addrs[0], 4);
          }
          origLookup.call(dns, h, o, cb);
        });
      };
    } catch {}
  }

  // Skip during `next build` (NEXT_PHASE = phase-production-build): build
  // workers render static pages without the runtime env by design. Validate
  // only when a real server boots (production or dev).
  if (
    process.env.NEXT_RUNTIME === 'nodejs' &&
    process.env.NEXT_PHASE !== 'phase-production-build'
  ) {
    const { assertLoggingConfig } = await import('@/lib/server-logger');
    assertLoggingConfig();
    const { installServerAccessLog } = await import('@/lib/server-access-log');
    installServerAccessLog();
  }
}
