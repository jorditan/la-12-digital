import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import {
  formatFreshnessLabel,
  getDataFreshness,
  type DataFreshness,
} from '../../services/dataFreshnessService';

export function DataFreshnessBanner() {
  const [freshness, setFreshness] = useState<DataFreshness | null>(null);

  useEffect(() => {
    let cancelled = false;

    getDataFreshness()
      .then((data) => {
        if (!cancelled) setFreshness(data);
      })
      .catch(() => {
        if (!cancelled) {
          setFreshness({
            lastSuccessAt: null,
            lastAttemptAt: null,
            lastSource: null,
            lastError: 'No se pudo leer el estado de sincronización',
            ageHours: null,
            isStale: true,
            usedFallback: true,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!freshness) return null;

  const label = formatFreshnessLabel(freshness);
  const isStale = freshness.isStale;

  return (
    <div
      role="status"
      className={[
        'flex items-center gap-2 px-3 sm:px-6 py-1.5 text-xs sm:text-sm border-b',
        isStale
          ? 'bg-amber-500/15 border-amber-500/40 text-amber-100'
          : 'bg-boca-blue-light/80 border-boca-border text-boca-gold/90',
      ].join(' ')}
      title={
        freshness.lastSource
          ? `Fuente: ${freshness.lastSource}${freshness.lastError ? ` · ${freshness.lastError}` : ''}`
          : undefined
      }
    >
      {isStale ? (
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" aria-hidden />
      ) : (
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" aria-hidden />
      )}
      <span className="min-w-0 truncate">
        <span className="font-medium">{label}</span>
        {isStale && (
          <span className="opacity-90">
            {' '}
            · Los resultados y la tabla pueden estar desactualizados
          </span>
        )}
      </span>
      {isStale && (
        <RefreshCw className="w-3 h-3 shrink-0 opacity-60 ml-auto hidden sm:block" aria-hidden />
      )}
    </div>
  );
}
