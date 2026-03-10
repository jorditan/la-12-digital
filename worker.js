/**
 * Cloudflare Workers Entry Point — La 12 Digital
 *
 * Routes:
 *   /api/sofascore/*  → proxied to api.sofascore.com with browser-like headers
 *                       so Cloudflare Bot Management on SofaScore doesn't block us.
 *   everything else   → served by Workers Assets (the Vite-built React SPA).
 *
 * Deploy:
 *   npm run build          # tsc + vite build → dist/
 *   npx wrangler deploy    # bundle worker.js + upload dist/ as assets
 */

const SOFASCORE_BASE = 'https://api.sofascore.com/api/v1';

// Only alphanumeric characters, hyphens, underscores, and forward-slashes are
// allowed in the path forwarded to SofaScore — prevents path traversal / injection.
const SAFE_PATH = /^[a-zA-Z0-9/_-]+$/;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Route SofaScore API calls through the proxy.
    if (url.pathname.startsWith('/api/sofascore/')) {
      return handleSofascoreProxy(request, url);
    }

    // Route YouTube API calls through the proxy (key stored as Cloudflare secret).
    if (url.pathname.startsWith('/api/youtube/')) {
      return handleYoutubeProxy(request, url, env);
    }

    // Route Newsdata.io API calls through the proxy (key stored as Cloudflare secret).
    if (url.pathname === '/api/newsdata') {
      return handleNewsdataProxy(request, url, env);
    }

    // Everything else is served by Workers Assets (the React SPA in ./dist).
    return env.ASSETS.fetch(request);
  },
};

async function handleYoutubeProxy(request, url, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const subpath = url.pathname.replace(/^\/api\/youtube\//, '');
  const params = new URLSearchParams(url.search);
  params.set('key', env.VITE_YOUTUBE_KEY ?? '');

  let upstreamRes;
  try {
    upstreamRes = await fetch(
      `https://www.googleapis.com/youtube/v3/${subpath}?${params}`,
    );
  } catch (err) {
    console.error('[youtube-proxy] upstream fetch failed:', err);
    return new Response(JSON.stringify({ error: 'upstream_error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const body = await upstreamRes.text();
  return new Response(body, {
    status: upstreamRes.status,
    headers: {
      'Content-Type': upstreamRes.headers.get('content-type') ?? 'application/json',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      ...CORS_HEADERS,
    },
  });
}

async function handleNewsdataProxy(request, url, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const params = new URLSearchParams(url.search);
  params.set('apikey', env.VITE_NEWS_API_KEY ?? '');

  let upstreamRes;
  try {
    upstreamRes = await fetch(`https://newsdata.io/api/1/news?${params}`);
  } catch (err) {
    console.error('[newsdata-proxy] upstream fetch failed:', err);
    return new Response(JSON.stringify({ error: 'upstream_error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const body = await upstreamRes.text();
  return new Response(body, {
    status: upstreamRes.status,
    headers: {
      'Content-Type': upstreamRes.headers.get('content-type') ?? 'application/json',
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      ...CORS_HEADERS,
    },
  });
}

async function handleSofascoreProxy(request, url) {
  // ── CORS preflight ────────────────────────────────────────────────────────
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // ── Extract & validate path ───────────────────────────────────────────────
  // Strip /api/sofascore/ prefix; the rest is forwarded directly to SofaScore.
  const sofaPath = url.pathname.replace(/^\/api\/sofascore\//, '');

  if (!sofaPath || !SAFE_PATH.test(sofaPath)) {
    return new Response('Invalid path', { status: 400 });
  }

  const sofaUrl = `${SOFASCORE_BASE}/${sofaPath}`;
  const isImageRequest = sofaPath.endsWith('/image');

  // ── Proxy request to SofaScore ────────────────────────────────────────────
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

  // ── Build response ────────────────────────────────────────────────────────
  const contentType = sofaResponse.headers.get('content-type') ?? 'application/json';

  // Log upstream status so it's visible in Cloudflare Observability.
  console.log(`[sofascore-proxy] ${sofaResponse.status} ${sofaPath}`);

  // For non-OK JSON responses return 502 so sofascoreService.ts throws an error
  // and does NOT cache empty data. The client falls back to TheSportsDB.
  if (!sofaResponse.ok && !isImageRequest) {
    console.warn(`[sofascore-proxy] upstream error: ${sofaResponse.status} ${sofaPath}`);
    return new Response(JSON.stringify({ events: [], standings: [] }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
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
