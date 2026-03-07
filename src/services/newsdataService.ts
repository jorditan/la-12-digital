import { getCachedData, setCachedData, CACHE_DURATION } from '../utils/cache';

const API_KEY = import.meta.env.VITE_NEWS_API_KEY as string;
const BASE_URL = 'https://newsdata.io/api/1/news';

interface NewsdataArticle {
  article_id: string;
  title: string;
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
  url: string;
}

export async function fetchNewsdataNoticias(): Promise<NoticiaRaw[]> {
  const CACHE_KEY = 'v3_newsdata_boca_noticias';

  const params = new URLSearchParams({
    apikey: API_KEY,
    q: 'Boca Juniors',
    country: 'ar',
    language: 'es',
    category: 'sports',
    image: '1',
    size: '9',
  });

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) throw new Error(`Newsdata error: ${res.status}`);

  const data: NewsdataResponse = await res.json();
  if (data.status !== 'success') throw new Error('Newsdata API error');

  const result: NoticiaRaw[] = data.results
    .filter(a => a.image_url)
    .filter((a, i, arr) => arr.findIndex(b => b.article_id === a.article_id) === i)
    .map(a => ({
      id:     a.article_id,
      titulo: a.title,
      imagen: a.image_url!,
      fecha:  a.pubDate,
      url:    a.link,
    }));

  if (result.length) setCachedData(CACHE_KEY, result);
  return result;
}
