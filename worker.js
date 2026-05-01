/**
 * Cloudflare Workers Entry Point — La 12 Digital
 *
 * Routes:
 *   /api/youtube/*    → proxied to googleapis.com/youtube/v3 (key from VITE_YOUTUBE_KEY secret)
 *   /api/newsdata     → proxied to newsdata.io/api/1/news (key from VITE_NEWS_API_KEY secret)
 *   /api/livescore/*  → proxied to livescore-api.com (key+secret from Cloudflare secrets)
 *   everything else   → served by Workers Assets (the Vite-built React SPA).
 *
 * Note: Open-Meteo (weather) and SofaScore are called directly from the browser.
 *       Open-Meteo is free, CORS-friendly and requires no API key.
 *       SofaScore blocks Cloudflare datacenter IPs via WAF.
 *
 * Deploy:
 *   npm run build          # tsc + vite build → dist/
 *   npx wrangler deploy    # bundle worker.js + upload dist/ as assets
 */

// FIX: Restrict CORS to known origins instead of wildcard
const ALLOWED_ORIGINS = [
  'https://la12digital.com',
  'https://www.la12digital.com',
  'https://la-12-digital.matiasowjordan.workers.dev',
  'http://localhost:5173', // dev
  'http://localhost:4173', // preview
];

function getCorsOrigin(request) {
  const origin = request.headers.get('Origin') || '';
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
}

function getCorsHeaders(request) {
  return {
    'Access-Control-Allow-Origin': getCorsOrigin(request),
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    // Prevent caches from serving one origin's response to another origin.
    Vary: 'Origin',
  };
}

// Security headers added to every HTML (SPA) response.
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  // Tell browsers to enforce HTTPS for one year (including subdomains).
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  // Prevent cross-origin windows from retaining a reference to this page.
  'Cross-Origin-Opener-Policy': 'same-origin',
  // CSP: restrict execution contexts while allowing the fonts and external APIs the
  // app actually needs. 'unsafe-inline' on style-src covers React inline style props
  // and Tailwind. Scripts are module-only (no inline scripts in the Vite build).
  // Note: these headers only run inside the Cloudflare Worker (production). In
  // development Vite serves without this worker, so no CSP applies there.
  // Open-Meteo (weather) and Wikipedia are called directly from the browser.
  // All other API calls are proxied through /api/* handlers on 'self'.
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' https: data:",
    "connect-src 'self' https://*.wikipedia.org https://api.open-meteo.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
  ].join('; '),
};

/** FIX: Simple in-memory rate limiter (resets per worker isolate restart) */
const _rlStore = new Map();

// Maximum number of unique IPs to track at once. Entries beyond this limit are
// dropped (the oldest entry is evicted), preventing unbounded memory growth under
// high traffic / IP-spoofing DDoS scenarios.
const RL_MAX_ENTRIES = 10_000;

/**
 * Returns true if the IP has exceeded the limit.
 * @param {string} ip
 * @param {number} limit - max requests per window
 * @param {number} windowMs - window in ms
 */
function isRateLimited(ip, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  const entry = _rlStore.get(ip) ?? { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }
  entry.count++;
  _rlStore.set(ip, entry);

  // Evict the oldest entry before the Map exceeds the size cap so that size
  // never grows beyond RL_MAX_ENTRIES even under rapid concurrent insertions.
  if (_rlStore.size >= RL_MAX_ENTRIES) {
    const oldestKey = _rlStore.keys().next().value;
    _rlStore.delete(oldestKey);
  }

  return entry.count > limit;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // FIX: Rate limiting for /api/* routes
    if (url.pathname.startsWith('/api/')) {
      const clientIp = request.headers.get('CF-Connecting-IP') ?? 'unknown';
      if (isRateLimited(clientIp)) {
        return new Response('Too Many Requests', {
          status: 429,
          headers: {
            'Retry-After': '60',
            'Content-Type': 'text/plain',
          },
        });
      }
    }

    // Route YouTube API calls through the proxy (key stored as VITE_YOUTUBE_KEY secret).
    if (url.pathname.startsWith('/api/youtube/')) {
      return handleYoutubeProxy(request, url, env);
    }

    // Route News aggregator: /api/boca-news?page=1&limit=12
    if (url.pathname === '/api/boca-news') {
      return handleBocaNews(request, url, env);
    }

    // Route Newsdata.io API calls through the proxy (key stored as VITE_NEWS_API_KEY secret).
    if (url.pathname === '/api/newsdata') {
      return handleNewsdataProxy(request, url, env);
    }

    // Route LiveScore API calls through the proxy (credentials stored as Cloudflare secrets).
    if (url.pathname.startsWith('/api/livescore/')) {
      return handleLivescoreProxy(request, url, env);
    }

    // Route Head-to-Head calls: /api/h2h/{team1_id}/{team2_id}
    if (url.pathname.startsWith('/api/h2h/')) {
      return handleH2HProxy(request, url, env);
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

// Allowed YouTube Data API v3 resource paths used by this application.
const ALLOWED_YOUTUBE_SUBPATHS = new Set(['channels', 'playlistItems', 'videos']);

// Query parameters the client is permitted to forward to the YouTube API.
const ALLOWED_YOUTUBE_PARAMS = new Set([
  'part',
  'forHandle',
  'playlistId',
  'maxResults',
  'id',
  'pageToken',
]);

async function handleBocaNews(request, url, env) {
  const corsHeaders = getCorsHeaders(request);
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const cache = caches.default;
  // Cambiamos a v2 para invalidar el caché viejo de 10 noticias
  const cacheKey = new Request(new URL('http://internal/boca-news-v2'), request);
  let cachedRes = await cache.match(cacheKey);

  let allNews = [];

  if (cachedRes) {
    allNews = await cachedRes.json();
  } else {
    // 1. Define sources
    const sources = [
      { name: 'Olé', url: 'https://www.ole.com.ar/rss/boca-juniors/' },
      { name: 'TyC Sports', url: 'https://www.tycsports.com/rss/boca-juniors.xml' },
      { name: 'Planeta Boca Juniors', url: 'https://www.planetabocajuniors.com.ar/feed/' },
    ];

    // 2. Fetch RSS in parallel
    const rssResults = await Promise.allSettled(
      sources.map(async (s) => {
        const res = await fetch(s.url, {
          headers: { 'User-Agent': 'La12Digital-Bot/1.0' },
          cf: { cacheTtl: 600 },
        });
        if (!res.ok) throw new Error(`RSS ${s.name} failed`);
        const xml = await res.text();
        return parseRSS(xml, s.name);
      })
    );

    const sourceResults = rssResults.filter((r) => r.status === 'fulfilled').map((r) => r.value);

    const mergedNews = [];
    const uniqueMap = new Map();

    // ALGORITMO ROUND-ROBIN: Una de cada fuente
    let hasMore = true;
    let i = 0;
    while (hasMore && mergedNews.length < 40) {
      // Margen para filtrar
      hasMore = false;
      sourceResults.forEach((sourceGroup) => {
        if (sourceGroup[i]) {
          const n = sourceGroup[i];
          const cleanUrl = n.url.split('?')[0].replace(/\/$/, '');
          if (!uniqueMap.has(cleanUrl)) {
            uniqueMap.set(cleanUrl, true);
            mergedNews.push(n);
          }
          hasMore = true;
        }
      });
      i++;
    }

    // 3. Fallback a Newsdata solo si no hay casi nada
    if (mergedNews.length < 5) {
      try {
        const params = new URLSearchParams({
          q: 'Boca Juniors',
          country: 'ar',
          language: 'es',
          category: 'sports',
          apikey: env.VITE_NEWS_API_KEY ?? '',
        });
        const ndRes = await fetch(`https://newsdata.io/api/1/news?${params}`);
        if (ndRes.ok) {
          const ndData = await ndRes.json();
          (ndData.results ?? []).forEach((a) => {
            if (mergedNews.length < 20) {
              mergedNews.push({
                id: a.article_id,
                titulo: a.title,
                imagen: a.image_url ?? '',
                fecha: a.pubDate,
                url: a.link,
                fuente: 'Newsdata',
              });
            }
          });
        }
      } catch (e) {
        console.error('Newsdata fallback failed', e);
      }
    }

    // Ordenar por fecha y limitar a 20 finales
    allNews = mergedNews
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 20);

    // 5. Save to Cache API (15 mins)
    const responseToCache = new Response(JSON.stringify(allNews), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 's-maxage=900' },
    });
    // cache.put requires a response that isn't already used
    await cache.put(cacheKey, responseToCache.clone());
  }

  // 6. Server-side Pagination
  const page = parseInt(url.searchParams.get('page') || '0');
  const limit = parseInt(url.searchParams.get('limit') || '12');
  const start = page * limit;
  const end = start + limit;
  const paginatedNews = allNews.slice(start, end);

  return new Response(
    JSON.stringify({
      results: paginatedNews,
      total: allNews.length,
      page,
      limit,
      pageCount: Math.ceil(allNews.length / limit),
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600',
        ...corsHeaders,
      },
    }
  );
}

/**
 * Lightweight RSS Parser using Regex.
 * Avoids heavy XML libraries for better Worker performance.
 */
function parseRSS(xml, sourceName) {
  const items = [];
  // Match <item> or <entry> blocks
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const content = match[1];
    const title = extractTag(content, 'title');
    const link = extractTag(content, 'link');
    const pubDate = extractTag(content, 'pubDate') || extractTag(content, 'dc:date');

    // Look for images in enclosure, media:content, or description
    let image = '';
    const enclosureMatch = content.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
    const mediaMatch = content.match(/<media:content[^>]+url=["']([^"']+)["']/i);

    if (enclosureMatch) image = enclosureMatch[1];
    else if (mediaMatch) image = mediaMatch[1];
    else {
      // Try to find an <img> tag in description
      const desc = extractTag(content, 'description');
      const imgInDesc = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgInDesc) image = imgInDesc[1];
    }

    if (title && link) {
      items.push({
        id: `rss-${btoa(link).substring(0, 16)}`,
        titulo: decodeEntities(title),
        imagen: image,
        fecha: pubDate || new Date().toISOString(),
        url: link,
        fuente: sourceName,
      });
    }
  }

  return items;
}

function extractTag(content, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = content.match(regex);
  if (!match) return '';
  return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
}

async function handleYoutubeProxy(request, url, env) {
  const corsHeaders = getCorsHeaders(request);
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const subpath = url.pathname.replace(/^\/api\/youtube\//, '');
  // Only allow the specific YouTube API resources the app actually needs.
  if (!ALLOWED_YOUTUBE_SUBPATHS.has(subpath)) {
    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }

  // Forward only explicitly allowed query parameters to prevent quota manipulation.
  const incomingParams = new URLSearchParams(url.search);
  const params = new URLSearchParams();
  for (const key of ALLOWED_YOUTUBE_PARAMS) {
    const val = incomingParams.get(key);
    if (val !== null) params.set(key, val);
  }
  params.set('key', env.VITE_YOUTUBE_KEY ?? '');

  let upstreamRes;
  try {
    upstreamRes = await fetch(`https://www.googleapis.com/youtube/v3/${subpath}?${params}`);
  } catch (err) {
    console.error('[youtube-proxy] upstream fetch failed:', err);
    return new Response(JSON.stringify({ error: 'upstream_error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const body = await upstreamRes.text();
  return new Response(body, {
    status: upstreamRes.status,
    headers: {
      'Content-Type': upstreamRes.headers.get('content-type') ?? 'application/json',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      ...corsHeaders,
    },
  });
}

// Query parameters the client is permitted to forward to the Newsdata API.
const ALLOWED_NEWSDATA_PARAMS = new Set([
  'q',
  'country',
  'language',
  'category',
  'image',
  'size',
  'page',
]);

async function handleNewsdataProxy(request, url, env) {
  const corsHeaders = getCorsHeaders(request);
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Forward only explicitly allowed query parameters to prevent quota manipulation.
  const incomingParams = new URLSearchParams(url.search);
  const params = new URLSearchParams();
  for (const key of ALLOWED_NEWSDATA_PARAMS) {
    const val = incomingParams.get(key);
    if (val !== null) params.set(key, val);
  }
  params.set('apikey', env.VITE_NEWS_API_KEY ?? '');

  let upstreamRes;
  try {
    upstreamRes = await fetch(`https://newsdata.io/api/1/news?${params}`);
  } catch (err) {
    console.error('[newsdata-proxy] upstream fetch failed:', err);
    return new Response(JSON.stringify({ error: 'upstream_error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const body = await upstreamRes.text();
  return new Response(body, {
    status: upstreamRes.status,
    headers: {
      'Content-Type': upstreamRes.headers.get('content-type') ?? 'application/json',
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      ...corsHeaders,
    },
  });
}

// Path validation for the LiveScore proxy.
// Each segment must start with an alphanumeric character to block '..' traversal,
// and only alphanumeric characters, hyphens, underscores, and dots are allowed
// within segments. Consecutive or trailing slashes are not permitted.
const SAFE_LIVESCORE_PATH = /^(\/[a-zA-Z0-9][a-zA-Z0-9_\-.]*)+$/;

async function handleH2HProxy(request, url, env) {
  const corsHeaders = getCorsHeaders(request);
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Expect /api/h2h/{team1_id}/{team2_id}
  const parts = url.pathname.replace(/^\/api\/h2h\//, '').split('/');
  if (parts.length !== 2 || !/^\d+$/.test(parts[0]) || !/^\d+$/.test(parts[1])) {
    return new Response('Invalid path', { status: 400 });
  }
  const [team1Id, team2Id] = parts;

  const params = new URLSearchParams();
  params.set('key', env.LIVESCORE_KEY ?? '');
  params.set('secret', env.LIVESCORE_SECRET ?? '');

  let upstreamRes;
  try {
    upstreamRes = await fetch(
      `https://livescore-api.com/api-client/teams/head2head.json?team1_id=${team1Id}&team2_id=${team2Id}&${params}`
    );
  } catch (err) {
    console.error('[h2h-proxy] upstream fetch failed:', err);
    return new Response(JSON.stringify({ error: 'upstream_error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const body = await upstreamRes.text();
  return new Response(body, {
    status: upstreamRes.status,
    headers: {
      'Content-Type': upstreamRes.headers.get('content-type') ?? 'application/json',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      ...corsHeaders,
    },
  });
}

// Query parameters the client is permitted to forward to the LiveScore API.
const ALLOWED_LIVESCORE_PARAMS = new Set([
  'competition_id',
  'from',
  'to',
  'team_id',
  'team',
  'team1_id',
  'team2_id',
  'match_id',
  'season',
  'round',
  'stage_id',
  'group_id',
  'type',
]);

async function handleLivescoreProxy(request, url, env) {
  const corsHeaders = getCorsHeaders(request);
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Strip the /api/livescore prefix; the remainder is forwarded to the upstream API.
  const subpath = url.pathname.replace(/^\/api\/livescore/, '');
  if (!subpath || !SAFE_LIVESCORE_PATH.test(subpath)) {
    return new Response('Invalid path', { status: 400 });
  }

  // Forward only explicitly allowed query parameters to prevent abuse.
  const incomingParams = new URLSearchParams(url.search);
  const params = new URLSearchParams();
  for (const key of ALLOWED_LIVESCORE_PARAMS) {
    const val = incomingParams.get(key);
    if (val !== null) params.set(key, val);
  }
  // Inject credentials server-side so they are never exposed to the browser.
  params.set('key', env.LIVESCORE_KEY ?? '');
  params.set('secret', env.LIVESCORE_SECRET ?? '');

  let upstreamRes;
  try {
    upstreamRes = await fetch(`https://livescore-api.com/api-client${subpath}?${params}`);
  } catch (err) {
    console.error('[livescore-proxy] upstream fetch failed:', err);
    return new Response(JSON.stringify({ error: 'upstream_error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const body = await upstreamRes.text();
  return new Response(body, {
    status: upstreamRes.status,
    headers: {
      'Content-Type': upstreamRes.headers.get('content-type') ?? 'application/json',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      ...corsHeaders,
    },
  });
}
