import { getCachedData, setCachedData, CACHE_DURATION } from "../utils/cache";

const isDev = import.meta.env.DEV;
const BASE_URL = "/api/boca-news";
const CACHE_VERSION = "v18_atom_fix";

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

/**
 * BUFFER DE DESARROLLO (LIMITADO A 15 REALES)
 */
const NEWS_BUFFER_DEV: NoticiaRaw[] = [
  { id: "1", titulo: "Velasco y su sueño de jugar en la Bombonera con la azul y oro", fuente: "Olé", imagen: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=800", url: "https://ole.com.ar", fecha: "2026-04-25T18:00:00Z" },
  { id: "2", titulo: "El 11 que planea Gago para el próximo partido por Copa", fuente: "TyC Sports", imagen: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800", url: "https://tycsports.com", fecha: "2026-04-25T17:30:00Z" },
  { id: "3", titulo: "La nueva joya de las inferiores que ya entrena con primera", fuente: "Planeta BJ", imagen: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800", url: "https://planetabocajuniors.com.ar", fecha: "2026-04-25T17:00:00Z" },
  { id: "4", titulo: "Riquelme y una charla clave con el plantel en Ezeiza", fuente: "Infobae", imagen: "https://images.unsplash.com/photo-1518091043644-c1d44575eaa2?q=80&w=800", url: "https://infobae.com", fecha: "2026-04-25T16:45:00Z" },
  ...Array.from({ length: 11 }).map((_, i) => ({
    id: `dev-news-${i}`,
    titulo: `Boca Juniors: Novedades del entrenamiento matutino pensando en el domingo`,
    imagen: `https://picsum.photos/seed/boca${i}/800/600`,
    fecha: new Date(Date.now() - i * 3600000).toISOString(),
    url: `https://la12digital.com/news/${i}`,
    fuente: i % 2 === 0 ? "Olé" : "TyC Sports"
  }))
];

export async function fetchBocaNews(page = 0, limit = 12): Promise<NewsResponse> {
  const CACHE_KEY = `${CACHE_VERSION}_p${page}_l${limit}`;
  const cached = getCachedData<NewsResponse>(CACHE_KEY, CACHE_DURATION.NEWS);
  if (cached) return cached;

  try {
    if (isDev) {
      const total = 15; 
      const start = page * limit;
      const results = NEWS_BUFFER_DEV.slice(0, 15).slice(start, start + limit);
      
      const response = {
        results,
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit)
      };
      
      setCachedData(CACHE_KEY, response);
      return response;
    }

    // LÓGICA DE PRODUCCIÓN (Worker)
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
