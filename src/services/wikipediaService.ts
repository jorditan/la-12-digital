import { IDOL_WIKIPEDIA_URLS } from "../data/wikipediaUrls";
import { getCachedData, setCachedData, CACHE_DURATION } from "../utils/cache";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";

const pending = new Map<string, Promise<string | null>>();

async function fetchFromWikipedia(url: string): Promise<string | null> {
  const match = url.match(/(\w{2})\.wikipedia\.org\/wiki\/(.+)$/);
  if (!match) return null;
  const [, lang, rawTitle] = match;

  // FIX: Sanitize title — only allow valid Wikipedia page name characters
  const title = decodeURIComponent(rawTitle);
  if (!/^[\w\s\-()'.,%&!]+$/u.test(title)) return null;

  // FIX: fetchWithTimeout prevents hanging on slow/dead APIs
  const res = await fetchWithTimeout(
    `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) return null;
  const data = await res.json();
  return (data.thumbnail?.source as string | undefined) ?? null;
}

export async function fetchIdolImage(idolId: string): Promise<string | null> {
  const wikiUrl = IDOL_WIKIPEDIA_URLS[idolId];
  if (!wikiUrl) return null;

  const CACHE_KEY = `wiki_img_${idolId}`;
  const cached = getCachedData<string>(CACHE_KEY, CACHE_DURATION.SQUAD);
  if (cached) return cached;

  if (pending.has(idolId)) return pending.get(idolId)!;

  const promise = fetchFromWikipedia(wikiUrl)
    .then((imgUrl) => {
      pending.delete(idolId);
      if (imgUrl) setCachedData(CACHE_KEY, imgUrl);
      return imgUrl;
    })
    .catch(() => {
      pending.delete(idolId);
      return null;
    });

  pending.set(idolId, promise);
  return promise;
}
