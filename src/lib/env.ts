/**
 * Environment helpers — env-only configuration.
 *
 * See `.cline/rules/env-policy.md`: no configuration value may be hard-coded;
 * missing values fail fast naming the variable, never fall back to literals.
 *
 * Note: Next.js inlines only *static* `process.env.NEXT_PUBLIC_*` expressions
 * into client bundles — client code must pass the statically-read value via
 * `requireValue`/`requireIntValue`. `requireEnv`/`requireIntEnv` do dynamic
 * lookups and are for server code (BFF routes) only.
 */

/** Validate a (statically read) env value — safe in client and server code. */
export function requireValue(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/** Validate a (statically read) env value as an integer. */
export function requireIntValue(name: string, value: string | undefined): number {
  const parsed = parseInt(requireValue(name, value), 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid integer for environment variable: ${name}`);
  }
  return parsed;
}

/** Required runtime env var (server code only — dynamic lookup). */
export function requireEnv(name: string): string {
  return requireValue(name, process.env[name]);
}

/** Required env var parsed as an integer (server code only). */
export function requireIntEnv(name: string): number {
  return requireIntValue(name, process.env[name]);
}

