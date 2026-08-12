import { fetchWithTimeout } from '../utils/fetchWithTimeout';

/**
 * WEATHER SERVICE — La 12 Digital
 * Proveedor: Open-Meteo (https://open-meteo.com)
 *   - Gratis, sin API key, hasta 16 días de forecast horario
 *   - CORS-friendly → se llama directamente desde el browser (sin proxy)
 *   - Coordenadas: La Bombonera, CABA
 */

const OPEN_METEO_URL =
  'https://api.open-meteo.com/v1/forecast' +
  '?latitude=-34.6345&longitude=-58.3699' +
  '&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,windspeed_10m,winddirection_10m,weathercode' +
  '&forecast_days=16&timezone=America%2FArgentina%2FBuenos_Aires';

const CACHE_KEY = 'cache:openmeteo';
const CACHE_TTL = 60 * 60 * 1000; // 1 hora

// ── Tipos públicos ─────────────────────────────────────────────────────────────

export interface HourlyForecast {
  time: string; // "YYYY-MM-DDTHH:MM" en tz Argentina
  tempC: number;
  humidityPct: number;
  precipitationProbPct: number;
  windSpeedKmh: number;
  windDir: string; // "N", "NE", "E", etc.
  weatherCode: number; // WMO code
  description: string;
  isGoodConditions: boolean; // tempC > 5 && precip < 40 && wind < 50
}

export interface MatchForecast {
  slotBefore: HourlyForecast | null;
  slotMatch: HourlyForecast | null;
  slotAfter: HourlyForecast | null;
  dateLabel: string; // "22 de marzo"
  timeLabel: string; // "20:00"
}

// ── Tipo interno de la respuesta de Open-Meteo ────────────────────────────────

interface OpenMeteoHourly {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  precipitation_probability: number[];
  windspeed_10m: number[];
  winddirection_10m: number[];
  weathercode: number[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function windDirFromDeg(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  return dirs[Math.round(deg / 45) % 8];
}

function wmoDescription(code: number): string {
  if (code === 0) return 'Cielo despejado';
  if (code <= 3) return 'Parcialmente nublado';
  if (code <= 48) return 'Niebla';
  if (code <= 55) return 'Llovizna';
  if (code <= 65) return 'Lluvia';
  if (code <= 82) return 'Chaparrones';
  if (code === 95) return 'Tormenta';
  return 'Variable';
}

function mapSlot(i: number, h: OpenMeteoHourly): HourlyForecast {
  const temp = h.temperature_2m[i];
  const precip = h.precipitation_probability[i];
  const windKmh = Math.round(h.windspeed_10m[i]);
  return {
    time: h.time[i],
    tempC: Math.round(temp),
    humidityPct: h.relative_humidity_2m[i],
    precipitationProbPct: precip,
    windSpeedKmh: windKmh,
    windDir: windDirFromDeg(h.winddirection_10m[i]),
    weatherCode: h.weathercode[i],
    description: wmoDescription(h.weathercode[i]),
    isGoodConditions: temp > 5 && precip < 40 && windKmh < 50,
  };
}

// Timestamp UTC de un slot (su time + offset fijo Argentina -03:00)
function slotTs(time: string): number {
  return new Date(time + ':00-03:00').getTime();
}

// ── Caché (localStorage) ─────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    /* storage lleno — ignorar */
  }
}

// ── Mock fallback ──────────────────────────────────────────────────────────────

function makeMockForecast(matchIso: string): MatchForecast {
  const matchDate = new Date(matchIso);
  const makeSlot = (offsetH: number): HourlyForecast => {
    const d = new Date(matchDate.getTime() + offsetH * 3600_000);
    const time = d
      .toLocaleString('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' })
      .slice(0, 16)
      .replace(' ', 'T');
    return {
      time,
      tempC: 22 - Math.abs(offsetH),
      humidityPct: 55,
      precipitationProbPct: 5,
      windSpeedKmh: 12,
      windDir: 'NE',
      weatherCode: 0,
      description: 'Cielo despejado',
      isGoodConditions: true,
    };
  };
  return {
    slotBefore: makeSlot(-2),
    slotMatch: makeSlot(0),
    slotAfter: makeSlot(2),
    dateLabel: matchDate.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      timeZone: 'America/Argentina/Buenos_Aires',
    }),
    timeLabel: matchDate.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Argentina/Buenos_Aires',
    }),
  };
}

// Evita reintentar si la request ya falló en esta sesión
let sessionFailed = false;

async function fetchAllSlots(): Promise<HourlyForecast[]> {
  const cached = getCached<HourlyForecast[]>(CACHE_KEY);
  if (cached) return cached;

  if (sessionFailed) return [];

  try {
    // FIX: fetchWithTimeout prevents hanging on slow/dead APIs
    const res = await fetchWithTimeout(OPEN_METEO_URL);
    if (!res.ok) throw new Error(`Open-Meteo error ${res.status}`);

    const json = (await res.json()) as { hourly: OpenMeteoHourly };
    const h = json.hourly;

    const slots: HourlyForecast[] = h.time.map((_, i) => mapSlot(i, h));
    setCache(CACHE_KEY, slots);
    return slots;
  } catch (err) {
    sessionFailed = true;
    console.warn('[open-meteo] request falló — usando mock hasta recargar', err);
    return [];
  }
}

// ── API pública ────────────────────────────────────────────────────────────────

export async function fetchMatchForecast(matchIso: string): Promise<MatchForecast> {
  const matchDate = new Date(matchIso);
  const dateLabel = matchDate.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
  const timeLabel = matchDate.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  });

  const slots = await fetchAllSlots();

  if (slots.length === 0) {
    return makeMockForecast(matchIso);
  }

  // Encontrar el índice del slot más cercano al horario del partido
  const matchTs = matchDate.getTime();
  const matchIdx = slots.reduce(
    (best, _, i) =>
      Math.abs(slotTs(slots[i].time) - matchTs) < Math.abs(slotTs(slots[best].time) - matchTs)
        ? i
        : best,
    0
  );

  return {
    slotBefore: matchIdx >= 2 ? slots[matchIdx - 2] : null,
    slotMatch: slots[matchIdx] ?? null,
    slotAfter: matchIdx + 2 < slots.length ? slots[matchIdx + 2] : null,
    dateLabel,
    timeLabel,
  };
}
