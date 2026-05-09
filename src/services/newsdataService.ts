const BASE_URL = "/api/boca-news";

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
}

export async function fetchBocaNews(): Promise<NewsResponse> {
  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("Worker news failed");
    return await res.json();
  } catch (error) {
    console.error("News fetch error:", error);
    return { results: [], total: 0 };
  }
}
