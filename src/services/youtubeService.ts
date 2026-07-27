import { getCachedData, setCachedData, CACHE_DURATION } from "../utils/cache";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";

export interface VideoItem {
  id: string;
  titulo: string;
  thumbnail: string;
  duracion: string;
  fecha: string;
  vistas: string;
}

// El Worker inyecta la clave en el servidor. En el cliente siempre usamos el proxy.
const isDev = import.meta.env.DEV;
const BASE = "/api/youtube";

// ── Helpers de formato ────────────────────────────────────────────────────────

function parseDuration(iso: string | undefined | null): string {
  if (!iso) return "0:00";
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  const h = parseInt(match[1] ?? "0");
  const m = parseInt(match[2] ?? "0");
  const s = parseInt(match[3] ?? "0");
  const ss = s.toString().padStart(2, "0");
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${ss}`;
  return `${m}:${ss}`;
}

function totalSeconds(iso: string | undefined | null): number {
  if (!iso) return 0;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (
    parseInt(match[1] ?? "0") * 3600 +
    parseInt(match[2] ?? "0") * 60 +
    parseInt(match[3] ?? "0")
  );
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
}

function isShort(title: string, durationIso: string | undefined | null): boolean {
  return title.includes("#") || totalSeconds(durationIso) < 300;
}

// ── Llamadas a la API ─────────────────────────────────────────────────────────

async function getUploadsPlaylistId(handle: string): Promise<string> {
  const params = new URLSearchParams({
    forHandle: handle.replace("@", ""),
    part: "contentDetails",
  });
  const res = await fetchWithTimeout(`${BASE}/channels?${params}`);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const detail = isDev ? ` — ${body.slice(0, 200)}` : "";
    throw new Error(`YouTube channels error (${handle}): ${res.status}${detail}`);
  }
  const data = await res.json();
  const playlistId: string | undefined =
    data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!playlistId) {
    const itemCount = data.items?.length ?? 0;
    throw new Error(
      `No uploads playlist found for handle: ${handle} (items returned: ${itemCount})`,
    );
  }
  return playlistId;
}

interface PlaylistItem {
  title: string;
  publishedAt: string;
  thumbnail: string;
  videoId: string;
}

async function getPlaylistItems(
  playlistId: string,
  maxResults = 12,
): Promise<PlaylistItem[]> {
  const params = new URLSearchParams({
    playlistId,
    part: "snippet",
    maxResults: String(maxResults),
  });
  const res = await fetchWithTimeout(`${BASE}/playlistItems?${params}`);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const detail = isDev ? ` — ${body.slice(0, 200)}` : "";
    throw new Error(
      `YouTube playlistItems error: ${res.status} (playlistId: ${playlistId})${detail}`,
    );
  }
  const data = await res.json();

  interface YoutubePlaylistItem {
    snippet: {
      title: string;
      publishedAt: string;
      thumbnails: {
        high?: { url: string };
        medium?: { url: string };
      };
      resourceId: {
        videoId: string;
      };
    };
  }

  return (data.items ?? []).map(
    (item: YoutubePlaylistItem) => ({
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt,
      thumbnail:
        item.snippet.thumbnails.high?.url ??
        item.snippet.thumbnails.medium?.url ??
        "",
      videoId: item.snippet.resourceId.videoId,
    }),
  );
}

interface VideoDetail {
  duration: string;
  viewCount: string;
}

async function getVideoDetails(
  ids: string[],
): Promise<Map<string, VideoDetail>> {
  const params = new URLSearchParams({
    id: ids.join(","),
    part: "contentDetails,statistics",
  });
  const res = await fetchWithTimeout(`${BASE}/videos?${params}`);
  if (!res.ok) throw new Error(`YouTube videos error: ${res.status}`);
  const data = await res.json();

  interface YoutubeVideoItem {
    id: string;
    contentDetails: {
      duration: string;
    };
    statistics: {
      viewCount?: string;
    };
  }

  return new Map(
    (data.items ?? []).map(
      (v: YoutubeVideoItem) => [
        v.id,
        {
          duration: v.contentDetails.duration,
          viewCount: v.statistics.viewCount ?? "0",
        },
      ],
    ),
  );
}

// ── Función principal ─────────────────────────────────────────────────────────

export async function fetchYoutubeVideos(handle: string): Promise<VideoItem[]> {
  if (!handle) return [];

  const CACHE_KEY = `v4_yt_videos_${handle}`;
  const cached = getCachedData<VideoItem[]>(CACHE_KEY, CACHE_DURATION.FIXTURES);
  if (cached) return cached;

  try {
    const playlistId = await getUploadsPlaylistId(handle);
    const items = await getPlaylistItems(playlistId, 50);

    if (items.length === 0) return [];

    const details = await getVideoDetails(items.map((i) => i.videoId));

    const result: VideoItem[] = items
      .filter((item) => {
        const detail = details.get(item.videoId);
        return detail ? !isShort(item.title, detail.duration) : false;
      })
      .slice(0, 12)
      .map((item) => {
        const detail = details.get(item.videoId)!;
        return {
          id: item.videoId,
          titulo: item.title,
          thumbnail: item.thumbnail,
          duracion: parseDuration(detail.duration),
          fecha: item.publishedAt,
          vistas: formatViews(parseInt(detail.viewCount)),
        };
      });

    if (result.length) setCachedData(CACHE_KEY, result);
    return result;
  } catch (err) {
    console.error(`YouTube fetch error (handle: ${handle}):`, err);
    return [];
  }
}
