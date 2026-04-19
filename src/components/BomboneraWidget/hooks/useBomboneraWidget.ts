import { useState, useEffect } from "react";
import {
  fetchMatchForecast,
  type MatchForecast,
} from "../../../services/weather";
import {
  fetchUpcomingMatches,
  type ProximoPartido,
  BOCA_ID,
} from "../../../services/apifootball";

// ── Helpers ───────────────────────────────────────────────────────────────────

export function isMatchDayMode(date: string): boolean {
  const diffMs = new Date(date).getTime() - Date.now();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 1;
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface BomboneraWidgetData {
  proximoLocal: ProximoPartido | null;
  proximosLocales: ProximoPartido[]; // siguientes partidos de local (sin el primero)
  diasHastaPartido: number | null;
  matchForecast: MatchForecast | null;
  matchDayMode: boolean;
  loading: boolean;
  error: string | null;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useBomboneraWidget(): BomboneraWidgetData {
  const [proximoLocal, setProximoLocal] = useState<ProximoPartido | null>(null);
  const [proximosLocales, setProximosLocales] = useState<ProximoPartido[]>([]);
  const [matchForecast, setMatchForecast] = useState<MatchForecast | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carga el próximo partido de local
  useEffect(() => {
    let cancelled = false;

    fetchUpcomingMatches()
      .then((matches) => {
        if (cancelled) return;
        const homeGames = matches.filter((m) => m.homeTeam.id === BOCA_ID);
        setProximoLocal(homeGames[0] ?? null);
        setProximosLocales(homeGames.slice(1, 3));
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("[BomboneraWidget] upcoming error →", err);
          setError("No se pudieron cargar los partidos");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Carga el pronóstico una vez que conocemos el partido
  useEffect(() => {
    if (!proximoLocal) return;
    let cancelled = false;

    fetchMatchForecast(proximoLocal.date)
      .then((data) => {
        if (!cancelled) setMatchForecast(data);
      })
      .catch((err) => {
        console.error("[BomboneraWidget] forecast error →", err);
      });

    return () => {
      cancelled = true;
    };
  }, [proximoLocal]);

  const diasHastaPartido = proximoLocal
    ? Math.max(
        0,
        Math.ceil(
          (new Date(proximoLocal.date).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  const matchDayMode = proximoLocal ? isMatchDayMode(proximoLocal.date) : false;

  return {
    proximoLocal,
    proximosLocales,
    diasHastaPartido,
    matchForecast,
    matchDayMode,
    loading,
    error,
  };
}
