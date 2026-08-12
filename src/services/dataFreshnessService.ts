import { supabase } from '../lib/supabase';

export type DataFreshness = {
  lastSuccessAt: Date | null;
  lastAttemptAt: Date | null;
  lastSource: string | null;
  lastError: string | null;
  ageHours: number | null;
  isStale: boolean;
  usedFallback: boolean;
  staleDatasets: string[];
};

type DatasetMetaRow = {
  dataset: string;
  last_success_at: string | null;
  last_attempt_at: string | null;
  last_source: string | null;
  last_error: string | null;
};

const STALE_HOURS = 36;
const CORE_DATASETS = [
  'league_liga',
  'league_libertadores',
  'league_sudamericana',
  'boca_fixtures',
] as const;

function hoursSince(date: Date | null): number | null {
  if (!date) return null;
  return (Date.now() - date.getTime()) / (1000 * 60 * 60);
}

function newestDate(values: Array<string | null>): Date | null {
  const timestamps = values
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value).getTime())
    .filter(Number.isFinite);
  return timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null;
}

export async function getDataFreshness(): Promise<DataFreshness> {
  const { data: datasetRows, error: datasetError } = await supabase
    .from('ls_sync_dataset_meta')
    .select('dataset, last_success_at, last_attempt_at, last_source, last_error')
    .in('dataset', [...CORE_DATASETS]);

  if (!datasetError && datasetRows && datasetRows.length > 0) {
    const byDataset = new Map((datasetRows as DatasetMetaRow[]).map((row) => [row.dataset, row]));
    const staleDatasets = CORE_DATASETS.filter((dataset) => {
      const row = byDataset.get(dataset);
      const age = hoursSince(row?.last_success_at ? new Date(row.last_success_at) : null);
      return age == null || age > STALE_HOURS || Boolean(row?.last_error);
    });

    const successfulDates = CORE_DATASETS.map(
      (dataset) => byDataset.get(dataset)?.last_success_at ?? null
    )
      .filter((value): value is string => Boolean(value))
      .map((value) => new Date(value));
    const oldestSuccess =
      successfulDates.length === CORE_DATASETS.length
        ? new Date(Math.min(...successfulDates.map((date) => date.getTime())))
        : null;
    const newestAttempt = newestDate(
      CORE_DATASETS.map((dataset) => byDataset.get(dataset)?.last_attempt_at ?? null)
    );
    const latestRow = [...byDataset.values()]
      .filter((row) => row.last_attempt_at)
      .sort(
        (a, b) => new Date(b.last_attempt_at!).getTime() - new Date(a.last_attempt_at!).getTime()
      )[0];
    const errors = [...byDataset.values()]
      .filter((row) => row.last_error)
      .map((row) => `${row.dataset}: ${row.last_error}`);
    const ageHours = hoursSince(oldestSuccess);

    return {
      lastSuccessAt: oldestSuccess,
      lastAttemptAt: newestAttempt,
      lastSource: latestRow?.last_source ?? null,
      lastError: errors.length > 0 ? errors.join(' · ') : null,
      ageHours,
      isStale: staleDatasets.length > 0,
      usedFallback: false,
      staleDatasets: [...staleDatasets],
    };
  }

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
      lastError: meta.last_error ?? datasetError?.message ?? null,
      ageHours,
      isStale: ageHours == null || ageHours > STALE_HOURS || Boolean(meta.last_error),
      usedFallback: true,
      staleDatasets: [],
    };
  }

  const [fixtures, standings] = await Promise.all([
    supabase
      .from('ls_fixtures')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1),
    supabase
      .from('ls_standings')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1),
  ]);
  const lastSuccessAt = newestDate([
    fixtures.data?.[0]?.updated_at ?? null,
    standings.data?.[0]?.updated_at ?? null,
  ]);
  const ageHours = hoursSince(lastSuccessAt);

  return {
    lastSuccessAt,
    lastAttemptAt: lastSuccessAt,
    lastSource: null,
    lastError: datasetError?.message ?? metaError?.message ?? null,
    ageHours,
    isStale: ageHours == null || ageHours > STALE_HOURS,
    usedFallback: true,
    staleDatasets: [],
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
  if (h < 48) return `Actualizado hace ${Math.round(h)} h`;
  const days = Math.round(h / 24);
  return `Actualizado hace ${days} día${days === 1 ? '' : 's'}`;
}
