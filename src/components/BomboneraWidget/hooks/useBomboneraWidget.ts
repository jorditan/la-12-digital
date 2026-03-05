import { useState, useEffect } from 'react';
import { fetchWeather, type WeatherData } from '../../../services/weather';
import { fetchUpcomingMatches, type ProximoPartido, BOCA_ID } from '../../../services/apifootball';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface BomboneraWidgetData {
  weather: WeatherData | null;
  proximoLocal: ProximoPartido | null;
  diasHastaPartido: number | null;
  loading: boolean;
  error: string | null;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useBomboneraWidget(): BomboneraWidgetData {
  const [weather, setWeather]           = useState<WeatherData | null>(null);
  const [proximoLocal, setProximoLocal] = useState<ProximoPartido | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [weatherResult, upcomingResult] = await Promise.allSettled([
          fetchWeather(),
          fetchUpcomingMatches(),
        ]);

        if (cancelled) return;

        if (weatherResult.status === 'fulfilled') {
          console.log('[BomboneraWidget] weather →', weatherResult.value);
          setWeather(weatherResult.value);
        } else {
          console.error('[BomboneraWidget] weather error →', weatherResult.reason);
        }

        if (upcomingResult.status === 'fulfilled') {
          console.log('[BomboneraWidget] upcoming (todos) →', upcomingResult.value);
          const homeGames = upcomingResult.value.filter(m => m.homeTeam.id === BOCA_ID);
          console.log('[BomboneraWidget] próximos locales →', homeGames);
          setProximoLocal(homeGames[0] ?? null);
        } else {
          console.error('[BomboneraWidget] upcoming error →', upcomingResult.reason);
        }

        const anyFailed =
          weatherResult.status === 'rejected' && upcomingResult.status === 'rejected';
        if (anyFailed) setError('No se pudieron cargar los datos');
      } catch {
        if (!cancelled) setError('Error inesperado al cargar datos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const diasHastaPartido = proximoLocal
    ? Math.max(0, Math.ceil(
        (new Date(proximoLocal.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ))
    : null;

  return { weather, proximoLocal, diasHastaPartido, loading, error };
}
