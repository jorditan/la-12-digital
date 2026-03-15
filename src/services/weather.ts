/**
 * WEATHER SERVICE — La 12 Digital
 * Proveedor: OpenWeatherMap (Current Weather API)
 * Docs: https://openweathermap.org/current
 *
 * En producción las llamadas se enrutan a través del proxy /api/weather
 * (Cloudflare Worker) donde la clave se inyecta del lado del servidor.
 * En desarrollo el proxy de Vite en vite.config.ts hace lo mismo desde .env.
 * Si no hay clave configurada, la request fallará y se usarán datos mock.
 */

const CACHE_TTL = 30 * 60 * 1000; // 30 minutos

// Coordenadas de La Bombonera, CABA
const LAT = -34.6358;
const LON = -58.3705;

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface WeatherData {
  temp: number;         // °C redondeado
  feelsLike: number;    // sensación térmica
  description: string;  // ej: "cielo claro"
  emoji: string;        // emoji representativo
  humidity: number;     // %
  windKmh: number;      // km/h
}

// ── Mock ──────────────────────────────────────────────────────────────────────

const MOCK_WEATHER: WeatherData = {
  temp: 24,
  feelsLike: 23,
  description: 'Despejado',
  emoji: '☀️',
  humidity: 55,
  windKmh: 12,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function conditionEmoji(code: number): string {
  if (code >= 200 && code < 300) return '⛈️';
  if (code >= 300 && code < 400) return '🌦️';
  if (code >= 500 && code < 600) return '🌧️';
  if (code >= 600 && code < 700) return '❄️';
  if (code >= 700 && code < 800) return '🌫️';
  if (code === 800)               return '☀️';
  if (code === 801)               return '🌤️';
  if (code === 802)               return '⛅';
  if (code >= 803)                return '☁️';
  return '🌡️';
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Caché (localStorage) ─────────────────────────────────────────────────────

const CACHE_KEY = 'cache:weather';

interface CacheEntry<T> { data: T; timestamp: number; }

function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) { localStorage.removeItem(key); return null; }
    return entry.data;
  } catch { return null; }
}

function setCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch { /* storage lleno — ignorar */ }
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

// Evita reintentar si la request ya falló en esta sesión de página
let sessionFailed = false;

export async function fetchWeather(): Promise<WeatherData> {
  if (sessionFailed) return MOCK_WEATHER;

  const cached = getCached<WeatherData>(CACHE_KEY);
  if (cached) return cached;

  try {
    const url = `/api/weather?lat=${LAT}&lon=${LON}&units=metric&lang=es`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OpenWeatherMap error ${res.status}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json = await res.json() as any;

    const data: WeatherData = {
      temp:        Math.round(json.main.temp),
      feelsLike:   Math.round(json.main.feels_like),
      description: capitalize(json.weather[0].description),
      emoji:       conditionEmoji(json.weather[0].id),
      humidity:    json.main.humidity,
      windKmh:     Math.round(json.wind.speed * 3.6),
    };

    setCache(CACHE_KEY, data);
    return data;
  } catch {
    // Key inválida, red caída o key nueva (OWM tarda ~2h en activar)
    // Marca la sesión para no reintentar hasta recargar la página
    sessionFailed = true;
    console.warn('[weather] request falló — usando mock hasta recargar la página');
    return MOCK_WEATHER;
  }
}
