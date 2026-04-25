// src/components/MiHistorial/ImportModal.tsx
import { useRef } from 'react';
import { Upload, Download, X } from 'lucide-react';
import { Button } from '../ui/Button';
import type { MatchResult } from '@/services/apifootball';
import type { UpsertAttendancePayload } from '@/types/attendance';
import type { EnrichedRow } from '@/hooks/useMatchEnricher';
import { useImportModal } from './useImportModal';

interface ImportModalProps {
  matches: MatchResult[];
  existingMatchIds: string[];
  upsert: (payload: UpsertAttendancePayload) => Promise<void>;
  onClose: () => void;
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

const StatusDot = ({ status }: { status: EnrichedRow['status'] }) => {
  const colors: Record<EnrichedRow['status'], string> = {
    found: 'bg-[#4ade80]',
    duplicate: 'bg-text-muted/30',
    not_found: 'bg-boca-gold',
  };
  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${colors[status]}`} />;
};

const PreviewRow = ({ row }: { row: EnrichedRow }) => {
  const rival =
    row.homeTeam && row.awayTeam ? `${row.homeTeam} vs ${row.awayTeam}` : row.rival;
  const score =
    row.homeGoals !== undefined && row.awayGoals !== undefined
      ? ` ${row.homeGoals}-${row.awayGoals}`
      : '';
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-boca-border/20 last:border-0">
      <StatusDot status={row.status} />
      <span className="type-caption text-text-nav flex-1 min-w-0 truncate">
        {row.fecha} · {rival}{score}
      </span>
      {row.league && (
        <span className="type-caption text-text-muted shrink-0 text-[10px] uppercase tracking-tighter bg-boca-blue-mid px-1.5 py-0.5 rounded-sm">
          {row.league}
        </span>
      )}
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────

export const ImportModal = ({ matches, existingMatchIds, upsert, onClose }: ImportModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  const {
    step,
    errors,
    enriched,
    progress,
    total,
    importedCount,
    importError,
    foundCount,
    duplicateCount,
    notFoundCount,
    downloadTemplate,
    handleFileChange,
    handleImport,
  } = useImportModal(matches, existingMatchIds, upsert, onClose);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-overlay flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-full max-w-2xl bg-boca-blue-light border border-boca-border rounded-sm shadow-2xl animate-fade-in overflow-hidden">

        {/* Header compartido */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-boca-border/60">
          <h2 className="type-card-title text-boca-gold">Importar historial</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">

          {/* ── idle ── */}
          {step === 'idle' && (
            <>
              <p className="type-body text-text-muted mb-5">
                Subí tu archivo para añadir partidos a tu historial de forma masiva.
                El sistema identificará automáticamente los resultados y competencias.
              </p>

              <button
                onClick={downloadTemplate}
                className="h-9 flex items-center gap-2 px-4 rounded-sm border border-boca-border text-text-muted hover:bg-boca-border/20 transition-colors type-caption mb-6"
              >
                <Download className="w-4 h-4" />
                Descargar plantilla
              </button>

              <label className="block border-2 border-dashed border-boca-border rounded-sm p-10 text-center cursor-pointer hover:border-boca-gold/40 transition-colors">
                <Upload className="w-10 h-10 text-text-muted mx-auto mb-3" />
                <span className="type-body text-text-muted">
                  Arrastrá tu archivo o{' '}
                  <span className="text-boca-gold">hacé clic para subirlo</span>
                </span>
                <span className="block type-caption text-text-muted/60 mt-1">
                  Excel (.xlsx) o CSV · hasta 200 partidos
                </span>
                <input
                  type="file"
                  accept=".xlsx,.csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {errors.length > 0 && (
                <div className="mt-4 p-3 rounded-sm bg-[#7f1d1d]/20 border border-[#991b1b]/40">
                  <p className="type-caption text-[#fca5a5] font-bold mb-2">
                    Errores en el archivo:
                  </p>
                  {errors.map(e => (
                    <p key={`${e.field}-${e.rowIndex}`} className="type-caption text-[#fca5a5]/80">
                      • {e.message}
                    </p>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── processing ── */}
          {step === 'processing' && (
            <div className="py-10 text-center">
              <p className="type-body text-text-muted mb-5">
                Procesando {progress} de {total} partidos...
              </p>
              <div className="w-full bg-boca-border/30 rounded-full h-2 max-w-sm mx-auto">
                <div
                  className="bg-boca-gold h-2 rounded-full transition-all duration-300"
                  style={{ width: `${total > 0 ? (progress / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* ── preview ── */}
          {step === 'preview' && (
            <>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-6 custom-scrollbar">
                {foundCount > 0 && (
                  <div>
                    <p className="type-caption text-[#4ade80] font-bold mb-2 uppercase tracking-wider text-[11px]">
                      Partidos identificados ({foundCount})
                    </p>
                    <div className="bg-black/20 rounded-sm px-3 py-1">
                      {enriched.filter(r => r.status === 'found').map(r => (
                        <PreviewRow key={r.rowIndex} row={r} />
                      ))}
                    </div>
                  </div>
                )}

                {notFoundCount > 0 && (
                  <div>
                    <p className="type-caption text-boca-gold font-bold mb-2 uppercase tracking-wider text-[11px]">
                      Partidos para añadir manualmente ({notFoundCount})
                    </p>
                    <div className="bg-black/20 rounded-sm px-3 py-1">
                      {enriched.filter(r => r.status === 'not_found').map(r => (
                        <PreviewRow key={r.rowIndex} row={r} />
                      ))}
                    </div>
                    <p className="type-caption text-text-muted/60 mt-2 italic">
                      Se usarán los datos proporcionados en tu archivo.
                    </p>
                  </div>
                )}

                {duplicateCount > 0 && (
                  <div className="pt-2">
                    <p className="type-caption text-text-muted/60 font-bold mb-2 uppercase tracking-wider text-[11px]">
                      Ya registrados ({duplicateCount})
                    </p>
                    <div className="bg-black/10 rounded-sm px-3 py-1 opacity-60">
                      {enriched.filter(r => r.status === 'duplicate').map(r => (
                        <PreviewRow key={r.rowIndex} row={r} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {importError && (
                <div className="mb-4 p-3 rounded-sm bg-[#7f1d1d]/20 border border-[#991b1b]/40">
                  <p className="type-caption text-[#fca5a5]">• {importError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={handleImport}
                  disabled={foundCount + notFoundCount === 0}
                  className={[
                    "flex-1 justify-center py-3 font-bold uppercase tracking-wide",
                    foundCount + notFoundCount === 0 ? 'opacity-40 cursor-not-allowed' : ''
                  ].join(" ")}
                >
                  Confirmar e importar {foundCount + notFoundCount} { (foundCount + notFoundCount) === 1 ? 'partido' : 'partidos' }
                </Button>
                <Button variant="outline" onClick={onClose} className="px-6 font-medium">
                  Cancelar
                </Button>
              </div>
            </>
          )}

          {/* ── success ── */}
          {step === 'success' && (
            <div className="py-10 text-center">
              <div className="w-16 h-16 bg-[#4ade80]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h3 className="type-card-title text-boca-gold mb-2 text-xl">
                ¡Importación completada!
              </h3>
              <p className="type-body text-text-muted mb-8 max-w-xs mx-auto">
                Se han añadido <strong>{importedCount}</strong> partidos a tu historial personal.
              </p>
              <Button variant="primary" onClick={onClose} className="px-10 py-3 font-bold uppercase tracking-wider">
                Cerrar y ver historial
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
