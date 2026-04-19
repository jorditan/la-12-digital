/**
 * Cloudflare Worker — SofaScore API Proxy
 *
 * Proxies requests to api.sofascore.com, adding browser-like headers so that
 * Cloudflare's bot protection (which blocks Vercel/AWS datacenter IPs) does not
 * interfere. Requests from a Cloudflare Worker traverse CF's own network, making
 * them far less likely to be flagged.
 *
 * Deploy instructions: see README.md → "Configuración del Cloudflare Worker"
 *
 * Routes handled:
 *   GET /<sofascore-path>          → https://api.sofascore.com/api/v1/<sofascore-path>
 *   OPTIONS (CORS preflight)       → 200 with CORS headers
 */

const SOFASCORE_BASE = "https://api.sofascore.com/api/v1";

// Only alphanumeric, hyphens, underscores, and forward-slashes are allowed in
// the path forwarded to SofaScore — prevents path traversal / injection.
const SAFE_PATH = /^[a-zA-Z0-9/_-]+$/;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request) {
    // ── CORS preflight ────────────────────────────────────────────────────────
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== "GET") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    // ── Extract & validate path ───────────────────────────────────────────────
    const url = new URL(request.url);
    // Strip leading slash; the rest is forwarded directly to SofaScore.
    const sofaPath = url.pathname.replace(/^\//, "");

    if (!sofaPath || !SAFE_PATH.test(sofaPath)) {
      return new Response("Invalid path", { status: 400 });
    }

    const sofaUrl = `${SOFASCORE_BASE}/${sofaPath}`;

    // ── Proxy request to SofaScore ────────────────────────────────────────────
    let sofaResponse;
    try {
      sofaResponse = await fetch(sofaUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          Accept:
            "application/json, image/webp, image/apng, image/*, */*;q=0.8",
          "Accept-Language": "es-AR,es;q=0.9,en-US;q=0.8,en;q=0.7",
          Referer: "https://www.sofascore.com/",
          Origin: "https://www.sofascore.com",
          "Cache-Control": "no-cache",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "Sec-CH-UA":
            '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
          "Sec-CH-UA-Mobile": "?0",
          "Sec-CH-UA-Platform": '"Windows"',
        },
      });
    } catch (err) {
      console.error("[sofascore-proxy] upstream fetch failed:", err);
      return new Response(JSON.stringify({ error: "upstream_error" }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    // ── Build response ────────────────────────────────────────────────────────
    const contentType =
      sofaResponse.headers.get("content-type") ?? "application/json";

    // Forward the body as-is but add CORS + cache headers.
    const responseHeaders = {
      "Content-Type": contentType,
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      ...CORS_HEADERS,
    };

    return new Response(sofaResponse.body, {
      status: sofaResponse.status,
      headers: responseHeaders,
    });
  },
};
