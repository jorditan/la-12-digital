import { getCachedData, setCachedData, CACHE_DURATION } from '../utils/cache';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

// In production the Worker injects the key server-side (Cloudflare secret).
// In dev we call Newsdata directly using the VITE_ key from .env.
const isDev = import.meta.env.DEV;
const API_KEY = isDev ? (import.meta.env.VITE_NEWS_API_KEY as string) : '';
const BASE_URL = isDev ? 'https://newsdata.io/api/1/news' : '/api/newsdata';

interface NewsdataArticle {
  article_id: string;
  title: string;
  description: string | null;
  link: string;
  image_url: string | null;
  pubDate: string;
}

interface NewsdataResponse {
  status: string;
  results: NewsdataArticle[];
}

export interface NoticiaRaw {
  id: string;
  titulo: string;
  imagen: string;
  fecha: string;
  url: string | undefined;
}

/** FIX: Verify URL uses http/https protocol (prevents javascript:, data:, etc.) */
function isSafeUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export async function fetchNewsdataNoticias(): Promise<NoticiaRaw[]> {
  const CACHE_KEY = 'v3_newsdata_boca_noticias';

  const cached = getCachedData<NoticiaRaw[]>(CACHE_KEY, CACHE_DURATION.SQUAD);
  if (cached) return cached;

  const paramsObj: Record<string, string> = {
    q: 'Boca Juniors',
    country: 'ar',
    language: 'es',
    category: 'sports',
    image: '1',
    size: '9',
  };
  if (isDev) paramsObj.apikey = API_KEY;
  const params = new URLSearchParams(paramsObj);

  // FIX: fetchWithTimeout prevents hanging on slow/dead APIs
  const res = await fetchWithTimeout(`${BASE_URL}?${params}`);
  if (!res.ok) throw new Error(`Newsdata error: ${res.status}`);

  const data: NewsdataResponse = await res.json();
  if (data.status !== 'success') throw new Error('Newsdata API error');

  const RIVER_RE = /river\s*plate|los\s*millonarios|el\s*millo\b/i;

  const result: NoticiaRaw[] = data.results
    .filter(a => a.image_url)
    .filter(a => !RIVER_RE.test(a.title) && !RIVER_RE.test(a.description ?? ''))
    .filter((a, i, arr) => arr.findIndex(b => b.article_id === a.article_id) === i)
    .map(a => ({
      id:     a.article_id,
      titulo: a.title,
      // FIX: Validate external URLs to prevent javascript:/data: injection
      imagen: isSafeUrl(a.image_url) ? a.image_url : '',
      fecha:  a.pubDate,
      url:    isSafeUrl(a.link) ? a.link : undefined,
    }))
    .filter(a => a.imagen !== '');

  if (result.length) setCachedData(CACHE_KEY, result);
  return result;
}
