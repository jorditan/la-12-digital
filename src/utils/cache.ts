/**
 * CACHE SERVICE - LA 12 DIGITAL
 * Sistema de caching en localStorage para evitar gastar rate limit
 *
 * API-Football FREE: 100 requests/día
 * Con caching: ~4-5 requests/día ✅
 */

interface CachedData<T> {
  data: T;
  timestamp: number;
}

/**
 * Duraciones de cache por tipo de dato
 */
export const CACHE_DURATION = {
  // Datos que cambian poco
  STANDINGS: 6 * 60 * 60 * 1000, // 6 horas (tabla cambia poco entre partidos)
  SQUAD: 24 * 60 * 60 * 1000, // 24 horas (plantel casi no cambia)

  // Datos que cambian más
  FIXTURES: 2 * 60 * 60 * 1000, // 2 horas (partidos pueden cambiar)
  INJURIES: 12 * 60 * 60 * 1000, // 12 horas (lesionados cambian poco)

  // Datos en tiempo real
  LIVE_MATCH: 2 * 60 * 1000, // 2 minutos (durante partido en vivo)
} as const;

/**
 * Obtener datos del cache
 * @returns null si no existe o expiró
 */
export function getCachedData<T>(key: string, maxAge: number): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp }: CachedData<T> = JSON.parse(cached);

    // Verificar si expiró
    if (Date.now() - timestamp > maxAge) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error reading cache:", error);
    return null;
  }
}

/**
 * Guardar datos en cache
 */
export function setCachedData<T>(key: string, data: T): void {
  try {
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cached));
  } catch (error) {
    console.error("Error saving cache:", error);
  }
}

/**
 * Limpiar cache expirado
 */
export function clearExpiredCache(): void {
  const keys = Object.keys(localStorage);
  let cleared = 0;

  keys.forEach((key) => {
    if (!key.startsWith("api_")) return;

    try {
      const cached = localStorage.getItem(key);
      if (!cached) return;

      const { timestamp } = JSON.parse(cached);
      // Si tiene más de 24 horas, eliminar
      if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(key);
        cleared++;
      }
    } catch (error) {
      // Si hay error parseando, eliminar
      localStorage.removeItem(key);
      cleared++;
    }
  });
}

/**
 * Limpiar TODO el cache de la app
 */
export function clearAllCache(): void {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith("api_")) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Ver estadísticas de cache
 */
export function getCacheStats() {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith("api_"));
  const totalSize = keys.reduce((acc, key) => {
    return acc + (localStorage.getItem(key)?.length || 0);
  }, 0);

  return {
    entries: keys.length,
    sizeKB: Math.round(totalSize / 1024),
    keys: keys
      .map((key) => {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        try {
          const { timestamp } = JSON.parse(cached);
          return {
            key,
            age: Math.round((Date.now() - timestamp) / 1000 / 60), // minutos
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean),
  };
}

// Limpiar cache expirado al cargar
clearExpiredCache();
