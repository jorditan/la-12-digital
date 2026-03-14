/**
 * Cloudflare Workers Entry Point — La 12 Digital
 *
 * Routes:
 *   /api/youtube/*    → proxied to googleapis.com/youtube/v3 (key from VITE_YOUTUBE_KEY secret)
 *   /api/newsdata     → proxied to newsdata.io/api/1/news (key from VITE_NEWS_API_KEY secret)
 *   /api/livescore/*  → proxied to livescore-api.com (key+secret from Cloudflare secrets)
 *   everything else   → served by Workers Assets (the Vite-built React SPA).
 *
 * Note: SofaScore is called directly from the browser in production.
 *       Cloudflare datacenter IPs are blocked by SofaScore's WAF, so proxying won't work.
 *
 * Deploy:
 *   npm run build          # tsc + vite build → dist/
 *   npx wrangler deploy    # bundle worker.js + upload dist/ as assets
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Security headers added to every HTML (SPA) response.
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  // CSP: restrict execution contexts while allowing the fonts and external APIs the
  // app actually needs. 'unsafe-inline' on style-src covers React inline style props
  // and Tailwind. Scripts are module-only (no inline scripts in the Vite build).
  // Note: these headers only run inside the Cloudflare Worker (production). In
  // development Vite serves without this worker, so no CSP applies there.
  // In production all API calls (YouTube, NewsData, LiveScore) are routed through
  // the /api/* proxy handlers on 'self', so connect-src only needs the two services
  // still called directly from the browser: OpenWeatherMap and Wikipedia.
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' https: data:",
    "connect-src 'self' https://api.openweathermap.org https://*.wikipedia.org",
    "frame-ancestors 'none'",
    "object-src 'none'",
  ].join('; '),
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Route YouTube API calls through the proxy (key stored as VITE_YOUTUBE_KEY secret).
    if (url.pathname.startsWith('/api/youtube/')) {
      return handleYoutubeProxy(request, url, env);
    }

    // Route Newsdata.io API calls through the proxy (key stored as VITE_NEWS_API_KEY secret).
    if (url.pathname === '/api/newsdata') {
      return handleNewsdataProxy(request, url, env);
    }

    // Route LiveScore API calls through the proxy (credentials stored as Cloudflare secrets).
    if (url.pathname.startsWith('/api/livescore/')) {
      return handleLivescoreProxy(request, url, env);
    }

    // Everything else is served by Workers Assets (the React SPA in ./dist).
    // Attach security headers to HTML responses so the SPA gets a proper security policy.
    const assetResponse = await env.ASSETS.fetch(request);
    const contentType = assetResponse.headers.get('Content-Type') ?? '';
    if (contentType.includes('text/html')) {
      const headers = new Headers(assetResponse.headers);
      for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
        headers.set(name, value);
      }
      return new Response(assetResponse.body, {
        status: assetResponse.status,
        headers,
      });
    }
    return assetResponse;
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

// Path validation for the LiveScore proxy.
// Each segment must start with an alphanumeric character to block '..' traversal,
// and only alphanumeric characters, hyphens, underscores, and dots are allowed
// within segments. Consecutive or trailing slashes are not permitted.
const SAFE_LIVESCORE_PATH = /^(\/[a-zA-Z0-9][a-zA-Z0-9_\-.]*)+$/;

async function handleLivescoreProxy(request, url, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Strip the /api/livescore prefix; the remainder is forwarded to the upstream API.
  const subpath = url.pathname.replace(/^\/api\/livescore/, '');
  if (!subpath || !SAFE_LIVESCORE_PATH.test(subpath)) {
    return new Response('Invalid path', { status: 400 });
  }

  // Inject credentials server-side so they are never exposed to the browser.
  const params = new URLSearchParams(url.search);
  params.set('key', env.VITE_LIVESCORE_KEY ?? '');
  params.set('secret', env.VITE_LIVESCORE_SECRET ?? '');

  let upstreamRes;
  try {
    upstreamRes = await fetch(
      `https://livescore-api.com/api-client${subpath}?${params}`,
    );
  } catch (err) {
    console.error('[livescore-proxy] upstream fetch failed:', err);
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
