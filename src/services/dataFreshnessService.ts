import { supabase } from '../lib/supabase';

export type DataFreshness = {
  lastSuccessAt: Date | null;
  lastAttemptAt: Date | null;
  lastSource: string | null;
  lastError: string | null;
  ageHours: number | null;
  /** Data older than 36h is considered stale for UI warnings */
  isStale: boolean;
  /** Fallback when meta row missing: max fixture/standings updated_at */
  usedFallback: boolean;
};

const STALE_HOURS = 36;

function hoursSince(date: Date | null): number | null {
  if (!date) return null;
  return (Date.now() - date.getTime()) / (1000 * 60 * 60);
}

/**
 * Reads sync freshness from ls_sync_meta, with fallback to table updated_at.
 */
export async function getDataFreshness(): Promise<DataFreshness> {
  const { data: meta, error: metaError } = await supabase
    .from('ls_sync_meta')
    .select('last_success_at, last_attempt_at, last_source, last_error')
    .eq('id', 'default')
    .maybeSingle();

  if (!metaError && meta?.last_success_at) {
    const lastSuccessAt = new Date(meta.last_success_at);
    const ageHours = hoursSince(lastSuccessAt);
    return {
      lastSuccessAt,
      lastAttemptAt: meta.last_attempt_at ? new Date(meta.last_attempt_at) : null,
      lastSource: meta.last_source ?? null,
      lastError: meta.last_error ?? null,
      ageHours,
      isStale: ageHours == null || ageHours > STALE_HOURS,
      usedFallback: false,
    };
  }

  // Fallback: newest write across football cache tables
  const [fixtures, standings] = await Promise.all([
    supabase.from('ls_fixtures').select('updated_at').order('updated_at', { ascending: false }).limit(1),
    supabase.from('ls_standings').select('updated_at').order('updated_at', { ascending: false }).limit(1),
  ]);

  const dates = [fixtures.data?.[0]?.updated_at, standings.data?.[0]?.updated_at]
    .filter(Boolean)
    .map((d) => new Date(d as string));

  const lastSuccessAt = dates.length
    ? new Date(Math.max(...dates.map((d) => d.getTime())))
    : null;
  const ageHours = hoursSince(lastSuccessAt);

  return {
    lastSuccessAt,
    lastAttemptAt: lastSuccessAt,
    lastSource: null,
    lastError: metaError?.message ?? null,
    ageHours,
    isStale: ageHours == null || ageHours > STALE_HOURS,
    usedFallback: true,
  };
}

export function formatFreshnessLabel(freshness: DataFreshness): string {
  if (!freshness.lastSuccessAt || freshness.ageHours == null) {
    return 'Sin datos de actualización';
  }

  const h = freshness.ageHours;
  if (h < 1) {
    const mins = Math.max(1, Math.round(h * 60));
    return `Actualizado hace ${mins} min`;
  }
  if (h < 48) {
    return `Actualizado hace ${Math.round(h)} h`;
  }
  const days = Math.round(h / 24);
  return `Actualizado hace ${days} día${days === 1 ? '' : 's'}`;
}
