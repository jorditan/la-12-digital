const PRIVATE_IPV4_RE =
  /^(10\.|127\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/;

function isSafeHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host === "::1") return false;
  if (PRIVATE_IPV4_RE.test(host)) return false;
  return true;
}

export function sanitizeExternalHref(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    if (!isSafeHostname(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function sanitizeImageSrc(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (raw.startsWith("/") || raw.startsWith("./")) return raw;
  if (raw.startsWith("data:image/")) return raw;
  return sanitizeExternalHref(raw);
}
