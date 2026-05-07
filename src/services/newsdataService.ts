import { getCachedData, setCachedData, CACHE_DURATION } from "../utils/cache";

const BASE_URL = "/api/boca-news";
const CACHE_VERSION = "v21_dedup_fix";

export interface NoticiaRaw {
  id: string;
  titulo: string;
  imagen: string;
  fecha: string;
  url: string | undefined;
  fuente?: string;
}

export interface NewsResponse {
  results: NoticiaRaw[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

export async function fetchBocaNews(page = 0, limit = 12): Promise<NewsResponse> {
  const CACHE_KEY = `${CACHE_VERSION}_p${page}_l${limit}`;
  const cached = getCachedData<NewsResponse>(CACHE_KEY, CACHE_DURATION.NEWS);
  if (cached) return cached;

  try {
    const res = await fetch(`${BASE_URL}?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error("Worker news failed");
    const data: NewsResponse = await res.json();
    setCachedData(CACHE_KEY, data);
    return data;

  } catch (error) {
    console.error("News fetch error:", error);
    return { results: [], total: 0, page, limit, pageCount: 0 };
  }
}

/** 
 * Mantengo por compatibilidad si algún componente viejo la usa,
 * pero ahora llama internamente a fetchBocaNews.
 */
export const fetchNewsdataNoticias = async () => {
  const res = await fetchBocaNews(0, 15);
  return res.results;
};
