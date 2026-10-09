/**
 * Stable public origin for metadata, robots and sitemaps.
 * Set NEXT_PUBLIC_SITE_URL explicitly in production; hosting URLs are fallbacks.
 */
export type SiteEnvironment = {
  NEXT_PUBLIC_SITE_URL?: string;
  NEXT_PUBLIC_APP_URL?: string;
  URL?: string;
  DEPLOY_PRIME_URL?: string;
  VERCEL_URL?: string;
  VEYRA_NOINDEX?: string;
};

export function resolveSiteOrigin(env: SiteEnvironment): string {
  const values = [
    env.NEXT_PUBLIC_SITE_URL,
    env.NEXT_PUBLIC_APP_URL,
    env.URL,
    env.DEPLOY_PRIME_URL,
    env.VERCEL_URL ? `https://${env.VERCEL_URL}` : undefined,
  ];
  for (const value of values) {
    if (!value) continue;
    try {
      const url = new URL(value);
      const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
      if ((url.protocol === "https:" || (url.protocol === "http:" && isLocal))
        && url.hostname && !url.username && !url.password) {
        return url.origin;
      }
    } catch {
      // Ignore malformed configuration and try the next trusted host value.
    }
  }
  return "http://localhost:3000";
}

export function shouldAvoidIndexing(env: SiteEnvironment): boolean {
  if (env.VEYRA_NOINDEX === "true") return true;
  // A missing trusted public origin must not expose localhost canonical metadata.
  return resolveSiteOrigin(env) === "http://localhost:3000";
}
