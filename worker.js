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
  'https://la12digital.dev',
  'https://www.la12digital.dev',
  'https://la-12-digital.matiasowjordan.workers.dev',
  'http://localhost:3000', // dev (vite)
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
  // Open-Meteo (weather), Wikipedia and Supabase are called directly from the browser.
  // All other API calls are proxied through /api/* handlers on 'self'.
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' https: data:",
    "connect-src 'self' https://*.supabase.co https://*.wikipedia.org https://api.open-meteo.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
  ].join('; '),
};

const _rlStore = new Map();
const RL_MAX_ENTRIES = 10_000;
const RL_KEY_PREFIX = 'rl:v1';
// 80% margin: KV is eventually consistent, so concurrent reads can temporarily undercount.
// We cap earlier to reduce burst leakage while keeping endpoints usable.
// For strict limits under heavy concurrency, migrate to Durable Objects.
const KV_LIMIT_MARGIN = 0.8;
const RATE_LIMIT_RULES = [
  { prefix: '/api/youtube/', bucket: 'youtube', limit: 120, windowMs: 60_000 },
  { prefix: '/api/newsdata', bucket: 'newsdata', limit: 60, windowMs: 60_000 },
  { prefix: '/api/livescore/', bucket: 'livescore', limit: 90, windowMs: 60_000 },
  { prefix: '/api/h2h/', bucket: 'h2h', limit: 60, windowMs: 60_000 },
  { prefix: '/api/boca-news', bucket: 'boca-news', limit: 40, windowMs: 60_000 },
];

const ALLOWED_NEWS_DOMAINS = new Set([
  'ole.com.ar',
  'infobae.com',
  'tycsports.com',
  'espn.com.ar',
  'clarin.com',
  'lanacion.com.ar',
  'tn.com.ar',
  'pagina12.com.ar',
  'ambito.com',
  'bolavip.com',
  'as.com',
  'diarioas.com',
  'ole.com',
]);

const ALLOWED_IMAGE_DOMAINS = new Set([
  ...ALLOWED_NEWS_DOMAINS,
  'resizer.glanacion.com',
  'cdn.jwplayer.com',
  'media.tycsports.com',
  'i.ytimg.com',
]);

function jsonError(status, code, message, corsHeaders = {}, extra = {}) {
  return new Response(
    JSON.stringify({ error: { code, message }, ...extra }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    },
  );
}

function readRateLimitRule(pathname) {
  return (
    RATE_LIMIT_RULES.find((rule) => pathname.startsWith(rule.prefix)) ?? {
      prefix: '/api/',
      bucket: 'api',
      limit: 60,
      windowMs: 60_000,
    }
  );
}

async function isRateLimited(request, url, env) {
  const clientIp = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const rule = readRateLimitRule(url.pathname);
  const now = Date.now();
  const windowSlot = Math.floor(now / rule.windowMs);
  const retryAfter = Math.ceil(rule.windowMs / 1000);
  const key = `${RL_KEY_PREFIX}:${rule.bucket}:${clientIp}:${windowSlot}`;

  // Prefer shared KV storage when configured (works across worker instances).
  // Note: KV increments here are eventually consistent and not strictly atomic.
  // If strict enforcement under high concurrency is required, migrate this path
  // to a Durable Object counter.
  if (env.RATE_LIMIT_KV && typeof env.RATE_LIMIT_KV.get === 'function') {
    const effectiveLimit = Math.max(1, Math.floor(rule.limit * KV_LIMIT_MARGIN));
    const current = Number((await env.RATE_LIMIT_KV.get(key)) ?? '0');
    const next = current + 1;
    await env.RATE_LIMIT_KV.put(key, String(next), {
      expirationTtl: retryAfter + 5,
    });
    return { limited: next > effectiveLimit, retryAfter };
  }

  // Fallback for environments without KV binding.
  const localKey = `${rule.bucket}:${clientIp}`;
  const entry = _rlStore.get(localKey) ?? { count: 0, resetAt: now + rule.windowMs };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + rule.windowMs;
  }
  entry.count++;
  const isNewEntry = !_rlStore.has(localKey);
  if (isNewEntry && _rlStore.size >= RL_MAX_ENTRIES) {
    const oldestKey = _rlStore.keys().next().value;
    _rlStore.delete(oldestKey);
  }
  _rlStore.set(localKey, entry);
  while (_rlStore.size > RL_MAX_ENTRIES) {
    const oldestKey = _rlStore.keys().next().value;
    _rlStore.delete(oldestKey);
  }

  return {
    limited: entry.count > rule.limit,
    retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
  };
}

function isAllowedHost(hostname, allowedHosts) {
  const host = hostname.toLowerCase();
  for (const allowedHost of allowedHosts) {
    if (host === allowedHost || host.endsWith(`.${allowedHost}`)) return true;
  }
  return false;
}

function sanitizeHttpsUrl(raw, allowedHosts, context = 'external_url') {
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'https:') {
      console.warn(`[security] blocked ${context}: non-https protocol`);
      return null;
    }
    if (allowedHosts && !isAllowedHost(parsed.hostname, allowedHosts)) {
      console.warn(`[security] blocked ${context}: host not allowed (${parsed.hostname})`);
      return null;
    }
    return parsed.toString();
  } catch {
    console.warn(`[security] blocked ${context}: invalid URL`);
    return null;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // FIX: Rate limiting for /api/* routes
    if (url.pathname.startsWith('/api/')) {
      const rateLimit = await isRateLimited(request, url, env);
      if (rateLimit.limited) {
        return jsonError(429, 'rate_limited', 'Too Many Requests', {
          ...getCorsHeaders(request),
          'Retry-After': String(rateLimit.retryAfter),
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
    // Attach security headers to HTML responses and cache headers to static assets.
    const assetResponse = await env.ASSETS.fetch(request);
    const contentType = assetResponse.headers.get('Content-Type') ?? '';
    const headers = new Headers(assetResponse.headers);

    const { pathname } = url;
    if (/^\/assets\/[^/]+\.(js|css)$/.test(pathname)) {
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (/\.(png|webp|svg|ico)$/.test(pathname)) {
      headers.set('Cache-Control', 'public, max-age=2592000, stale-while-revalidate=86400');
    } else if (/\/(robots\.txt|sitemap\.xml|manifest\.json)$/.test(pathname)) {
      headers.set('Cache-Control', 'public, max-age=86400');
    }

    if (contentType.includes('text/html')) {
      for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
        headers.set(name, value);
      }
    }

    return new Response(assetResponse.body, {
      status: assetResponse.status,
      headers,
    });
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
  if (request.method !== 'GET') {
    return jsonError(405, 'method_not_allowed', 'Method Not Allowed', corsHeaders);
  }

  const cache = caches.default;
  const cacheKey = new Request(new URL('http://internal/boca-news-v8'), request);
  let cachedRes = await cache.match(cacheKey);

  let allNews = [];

  if (cachedRes) {
    allNews = await cachedRes.json();
  } else {
    // 1. RSS sources con límite por fuente
    const rssSources = [
      { name: 'Olé', url: 'https://www.ole.com.ar/rss/boca-juniors/', limit: 10 },
      { name: 'Infobae', url: 'https://www.infobae.com/feeds/rss/deportes-arg/', limit: 5, filterBoca: true },
    ];

    // 2. Fetch RSS en paralelo (5s timeout cada uno)
    const rssResults = await Promise.allSettled(
      rssSources.map(async (s) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        try {
          const res = await fetch(s.url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; La12Digital-Bot/1.0)' },
            cf: { cacheTtl: 600 },
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const xml = await res.text();
          const items = parseRSS(xml, s.name);
          const filtered = s.filterBoca ? items.filter((n) => /boca/i.test(n.titulo)) : items;
          return filtered.slice(0, s.limit);
        } finally {
          clearTimeout(timer);
        }
      })
    );

    rssResults.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        console.log(`[boca-news] RSS OK: ${rssSources[i].name} → ${r.value.length} items`);
      } else {
        console.error(`[boca-news] RSS FAIL: ${rssSources[i].name} → ${r.reason}`);
      }
    });

    const seenUrls = new Set();
    const seenTitles = new Set();
    const mergedNews = [];

    const normalizeTitle = (t) =>
      (t ?? '').toLowerCase().replace(/[^a-z0-9áéíóúñü\s]/g, '').replace(/\s+/g, ' ').trim().substring(0, 80);

    const addItem = (n) => {
      const safeUrl = sanitizeHttpsUrl(n.url, ALLOWED_NEWS_DOMAINS, 'news_link');
      const safeImage = sanitizeHttpsUrl(n.imagen, ALLOWED_IMAGE_DOMAINS, 'news_image') ?? '';
      const cleanUrl = (safeUrl ?? '').split('?')[0].replace(/\/$/, '');
      const normTitle = normalizeTitle(n.titulo);
      if (!cleanUrl || seenUrls.has(cleanUrl) || (normTitle && seenTitles.has(normTitle))) return;
      seenUrls.add(cleanUrl);
      if (normTitle) seenTitles.add(normTitle);
      mergedNews.push({ ...n, url: safeUrl, imagen: safeImage });
    };

    // Agregar RSS results
    rssResults.forEach((r) => {
      if (r.status === 'fulfilled') r.value.forEach(addItem);
    });

    // 3. NewsData.io — siempre fetchear, hasta 9 artículos
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
        let ndCount = 0;
        for (const a of ndData.results ?? []) {
          if (ndCount >= 9) break;
          if (!a.link) continue;
          const before = mergedNews.length;
          addItem({
            id: a.article_id,
            titulo: a.title,
            imagen: a.image_url ?? '',
            fecha: a.pubDate,
            url: a.link,
            fuente: a.source_name || a.source_id || 'Newsdata',
          });
          if (mergedNews.length > before) ndCount++;
        }
        console.log(`[boca-news] Newsdata OK → ${ndCount} items`);
      }
    } catch (e) {
      console.error('[boca-news] Newsdata failed', e);
    }

    // Ordenar por fecha descendente
    allNews = mergedNews.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    const countBySource = allNews.reduce((acc, n) => { acc[n.fuente] = (acc[n.fuente] ?? 0) + 1; return acc; }, {});
    console.log('[boca-news] Final mix:', countBySource, `→ total ${allNews.length}`);

    // Cache 15 mins
    const responseToCache = new Response(JSON.stringify(allNews), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 's-maxage=900' },
    });
    await cache.put(cacheKey, responseToCache.clone());
  }

  // Paginación server-side
  const page = parseInt(url.searchParams.get('page') || '0');
  const limit = parseInt(url.searchParams.get('limit') || '12');
  const start = page * limit;
  const paginatedNews = allNews.slice(start, start + limit);

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
 * Lightweight RSS/Atom Parser using Regex.
 * Supports RSS 2.0 (<item>) and Atom 1.0 (<entry>) formats.
 */
function parseRSS(xml, sourceName) {
  const items = [];
  // Support both RSS 2.0 (<item>) and Atom 1.0 (<entry>)
  const itemRegex = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const content = match[1];
    const title = extractTag(content, 'title');

    // RSS 2.0: <link>url</link> or <guid>url</guid>
    // Atom 1.0: <link href="url" rel="alternate"/> (self-closing, no text content)
    let link = extractTag(content, 'link');
    if (!link) {
      // Try Atom self-closing <link href="...">
      const atomLink = content.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i);
      if (atomLink) link = atomLink[1];
    }
    if (!link) link = extractTag(content, 'guid');

    // Date: RSS pubDate, Atom updated/published, or dc:date
    const pubDate =
      extractTag(content, 'pubDate') ||
      extractTag(content, 'updated') ||
      extractTag(content, 'published') ||
      extractTag(content, 'dc:date');

    // Images: enclosure, media:content, or <img> in description/content
    let image = '';
    const enclosureMatch = content.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
    const mediaMatch = content.match(/<media:content[^>]+url=["']([^"']+)["']/i);
    const mediaThumbnail = content.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);

    if (enclosureMatch) image = enclosureMatch[1];
    else if (mediaMatch) image = mediaMatch[1];
    else if (mediaThumbnail) image = mediaThumbnail[1];
    else {
      const desc = extractTag(content, 'description') || extractTag(content, 'content');
      const imgInDesc = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgInDesc) image = imgInDesc[1];
    }

    const safeLink = sanitizeHttpsUrl(link, ALLOWED_NEWS_DOMAINS, 'rss_link');
    const safeImage = sanitizeHttpsUrl(image, ALLOWED_IMAGE_DOMAINS, 'rss_image') ?? '';
    if (title && safeLink) {
      // btoa can fail on non-Latin1 chars — use a safe fallback id
      let id;
      try {
        id = `rss-${btoa(unescape(encodeURIComponent(safeLink))).substring(0, 16)}`;
      } catch {
        id = `rss-${sourceName}-${items.length}`;
      }
      items.push({
        id,
        titulo: decodeEntities(title),
        imagen: safeImage,
        fecha: pubDate || new Date().toISOString(),
        url: safeLink,
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
    return jsonError(405, 'method_not_allowed', 'Method Not Allowed', corsHeaders);
  }

  const subpath = url.pathname.replace(/^\/api\/youtube\//, '');
  // Only allow the specific YouTube API resources the app actually needs.
  if (!ALLOWED_YOUTUBE_SUBPATHS.has(subpath)) {
    return jsonError(404, 'not_found', 'Not Found', corsHeaders);
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
    return jsonError(502, 'upstream_error', 'Upstream provider unavailable', corsHeaders);
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
    return jsonError(405, 'method_not_allowed', 'Method Not Allowed', corsHeaders);
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
    return jsonError(502, 'upstream_error', 'Upstream provider unavailable', corsHeaders);
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
    return jsonError(405, 'method_not_allowed', 'Method Not Allowed', corsHeaders);
  }

  // Expect /api/h2h/{team1_id}/{team2_id}
  const parts = url.pathname.replace(/^\/api\/h2h\//, '').split('/');
  if (parts.length !== 2 || !/^\d+$/.test(parts[0]) || !/^\d+$/.test(parts[1])) {
    return jsonError(400, 'invalid_path', 'Invalid path', corsHeaders);
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
    return jsonError(502, 'upstream_error', 'Upstream provider unavailable', corsHeaders);
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
    return jsonError(405, 'method_not_allowed', 'Method Not Allowed', corsHeaders);
  }

  // Strip the /api/livescore prefix; the remainder is forwarded to the upstream API.
  const subpath = url.pathname.replace(/^\/api\/livescore/, '');
  if (!subpath || !SAFE_LIVESCORE_PATH.test(subpath)) {
    return jsonError(400, 'invalid_path', 'Invalid path', corsHeaders);
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
    return jsonError(502, 'upstream_error', 'Upstream provider unavailable', corsHeaders);
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
