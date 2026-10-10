/**
 * Accept only same-origin application paths for post-login navigation.
 * Never pass raw user-controlled query parameters directly into redirects.
 */
export function safeInternalRedirect(
  candidate: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (typeof candidate !== "string" || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback;
  }
  if (candidate.includes("\\") || /[\u0000-\u001f\u007f]/.test(candidate)) return fallback;
  try {
    const internalOrigin = "https://veyra.internal";
    const destination = new URL(candidate, internalOrigin);
    if (destination.origin !== internalOrigin || destination.protocol !== "https:") return fallback;
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return fallback;
  }
}
