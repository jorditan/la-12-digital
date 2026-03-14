/**
 * Cloudflare Workers Entry Point — La 12 Digital
 *
 * Routes:
 *   /api/youtube/*    → proxied to googleapis.com/youtube/v3 (key from VITE_YOUTUBE_KEY secret)
 *   /api/newsdata     → proxied to newsdata.io/api/1/news (key from VITE_NEWS_API_KEY secret)
 *   /api/livescore/*  → proxied to livescore-api.com/api-client (keys from LIVESCORE_KEY/LIVESCORE_SECRET secrets)
 *   everything else   → served by Workers Assets (the Vite-built React SPA).
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

    // Route Live Score API calls through the proxy (keys stored as LIVESCORE_KEY/LIVESCORE_SECRET secrets).
    if (url.pathname.startsWith('/api/livescore/')) {
      return handleLivescoreProxy(request, url, env);
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

async function handleLivescoreProxy(request, url, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const subpath = url.pathname.replace(/^\/api\/livescore/, '');
  const params = new URLSearchParams(url.search);
  params.set('key', env.LIVESCORE_KEY ?? '');
  params.set('secret', env.LIVESCORE_SECRET ?? '');

  let upstreamRes;
  try {
    upstreamRes = await fetch(`https://livescore-api.com/api-client${subpath}?${params}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; la-12-digital/1.0)',
        'Accept': 'application/json',
      },
    });
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
