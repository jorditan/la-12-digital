/**
 * Cloudflare Pages Function — SofaScore API Proxy
 *
 * Handles all requests to /api/sofascore/* and forwards them to
 * api.sofascore.com with browser-like headers so Cloudflare Bot Management
 * does not block the request.
 *
 * This makes the default VITE_SOFASCORE_PROXY_URL fallback ("/api/sofascore")
 * work on Cloudflare Pages without requiring a separately-deployed Worker or
 * any extra environment variables.
 *
 * Route: /api/sofascore/:path*
 *   e.g. /api/sofascore/team/3202/events/last/0
 *        → https://api.sofascore.com/api/v1/team/3202/events/last/0
 */

const SOFASCORE_BASE = 'https://api.sofascore.com/api/v1';

// Only alphanumeric characters, hyphens, underscores, and forward-slashes are
// allowed — prevents path traversal / injection.
const SAFE_PATH = /^[a-zA-Z0-9/_-]+$/;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequest({ request, params }) {
  // ── CORS preflight ──────────────────────────────────────────────────────────
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // ── Extract & validate path ─────────────────────────────────────────────────
  // params.path is the catch-all array, e.g. ["team","3202","events","last","0"]
  const pathSegments = params.path;
  const sofaPath = Array.isArray(pathSegments)
    ? pathSegments.join('/')
    : (pathSegments ?? '');

  if (!sofaPath || !SAFE_PATH.test(sofaPath)) {
    return new Response('Invalid path', { status: 400 });
  }

  const sofaUrl = `${SOFASCORE_BASE}/${sofaPath}`;
  const isImageRequest = sofaPath.endsWith('/image');

  // ── Proxy request to SofaScore ──────────────────────────────────────────────
  let sofaResponse;
  try {
    sofaResponse = await fetch(sofaUrl, {
      headers: {
        // Browser-like headers that mimic a real Chrome user visiting sofascore.com.
        // This is intentional: Cloudflare Bot Management on SofaScore blocks datacenter
        // IPs unless the request looks like it comes from a real browser session.
        // Keep the Chrome version in sync with cf-worker/index.js when updating.
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        Accept: isImageRequest
          ? 'image/webp,image/apng,image/*,*/*;q=0.8'
          : 'application/json, image/webp, image/apng, image/*, */*;q=0.8',
        'Accept-Language': 'es-AR,es;q=0.9,en-US;q=0.8,en;q=0.7',
        Referer: 'https://www.sofascore.com/',
        Origin: 'https://www.sofascore.com',
        'Cache-Control': 'no-cache',
        'Sec-Fetch-Dest': isImageRequest ? 'image' : 'empty',
        'Sec-Fetch-Mode': isImageRequest ? 'no-cors' : 'cors',
        // 'same-origin' is intentional: combined with Origin/Referer pointing to
        // sofascore.com it makes the request look like an in-page XHR call from the
        // SofaScore website itself, which is the accepted bot-bypass technique.
        'Sec-Fetch-Site': 'same-origin',
        // Keep in sync with User-Agent Chrome version above.
        'Sec-CH-UA': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'Sec-CH-UA-Mobile': '?0',
        'Sec-CH-UA-Platform': '"Windows"',
      },
    });
  } catch (err) {
    console.error('[sofascore-proxy] upstream fetch failed:', err);
    return new Response(JSON.stringify({ error: 'upstream_error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  // ── Build response ──────────────────────────────────────────────────────────
  const contentType = sofaResponse.headers.get('content-type') ?? 'application/json';

  // For non-OK JSON responses return empty data so the client falls back to
  // TheSportsDB without generating browser console errors.
  if (!sofaResponse.ok && !isImageRequest) {
    return new Response(JSON.stringify({ events: [], standings: [] }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        ...CORS_HEADERS,
      },
    });
  }

  return new Response(sofaResponse.body, {
    status: sofaResponse.status,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': isImageRequest
        ? 'public, s-maxage=86400, stale-while-revalidate=604800'
        : 'public, s-maxage=300, stale-while-revalidate=600',
      ...CORS_HEADERS,
    },
  });
}
