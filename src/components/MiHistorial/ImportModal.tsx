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
  existingFixtureIds: number[];
  upsert: (payload: UpsertAttendancePayload) => Promise<void>;
  onClose: () => void;
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

const StatusDot = ({ status }: { status: EnrichedRow['status'] }) => {
  const colors: Record<EnrichedRow['status'], string> = {
    found: 'bg-[#4ade80]',
    duplicate: 'bg-boca-gold',
    not_found: 'bg-[#fca5a5]',
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
    <div className="flex items-center gap-2 py-1">
      <StatusDot status={row.status} />
      <span className="type-caption text-text-nav flex-1 min-w-0 truncate">
        {row.fecha} · {rival}{score}
      </span>
      {row.league && (
        <span className="type-caption text-text-muted shrink-0">{row.league}</span>
      )}
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────

export const ImportModal = ({ matches, existingFixtureIds, upsert, onClose }: ImportModalProps) => {
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
  } = useImportModal(matches, existingFixtureIds, upsert, onClose);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-full max-w-2xl bg-boca-blue-light border border-boca-border rounded-sm shadow-2xl animate-fade-in">

        {/* Header compartido */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-boca-border/60">
          <h2 className="type-card-title text-boca-gold">Importar partidos</h2>
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
                Descargá el template, completalo con tus partidos y subilo acá.
                El sistema va a buscar automáticamente el resultado y la competencia.
              </p>

              <button
                onClick={downloadTemplate}
                className="h-9 flex items-center gap-2 px-4 rounded-sm border border-boca-border text-text-muted hover:bg-boca-border/20 transition-colors type-caption mb-6"
              >
                <Download className="w-4 h-4" />
                Descargar template
              </button>

              <label className="block border-2 border-dashed border-boca-border rounded-sm p-8 text-center cursor-pointer hover:border-boca-gold/40 transition-colors">
                <Upload className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <span className="type-body text-text-muted">
                  Arrastrá tu archivo acá o{' '}
                  <span className="text-boca-gold">hacé clic para seleccionar</span>
                </span>
                <span className="block type-caption text-text-muted/60 mt-1">
                  .xlsx o .csv · máx. 2MB · hasta 200 partidos
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
                    Se encontraron errores en el archivo:
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
            <div className="py-8 text-center">
              <p className="type-body text-text-muted mb-4">
                Analizando {progress} de {total} partidos...
              </p>
              <div className="w-full bg-boca-border/30 rounded-full h-2">
                <div
                  className="bg-boca-gold h-2 rounded-full transition-all"
                  style={{ width: `${total > 0 ? (progress / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* ── preview ── */}
          {step === 'preview' && (
            <>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1 mb-5">
                {foundCount > 0 && (
                  <div>
                    <p className="type-caption text-[#4ade80] font-bold mb-2">
                      Listos para importar ({foundCount})
                    </p>
                    {enriched.filter(r => r.status === 'found').map(r => (
                      <PreviewRow key={r.rowIndex} row={r} />
                    ))}
                  </div>
                )}

                {duplicateCount > 0 && (
                  <div>
                    <p className="type-caption text-boca-gold font-bold mb-2">
                      Ya en tu historial — se omiten ({duplicateCount})
                    </p>
                    {enriched.filter(r => r.status === 'duplicate').map(r => (
                      <PreviewRow key={r.rowIndex} row={r} />
                    ))}
                  </div>
                )}

                {notFoundCount > 0 && (
                  <div>
                    <p className="type-caption text-[#fca5a5] font-bold mb-2">
                      No encontrados en el sistema ({notFoundCount})
                    </p>
                    {enriched.filter(r => r.status === 'not_found').map(r => (
                      <PreviewRow key={r.rowIndex} row={r} />
                    ))}
                    <p className="type-caption text-text-muted/60 mt-1">
                      Solo se importan partidos disponibles en el sistema (últimos meses).
                    </p>
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
                  disabled={foundCount === 0}
                  className={foundCount === 0 ? 'opacity-40 cursor-not-allowed' : ''}
                >
                  Importar {foundCount} {foundCount === 1 ? 'partido' : 'partidos'}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
              </div>
            </>
          )}

          {/* ── success ── */}
          {step === 'success' && (
            <div className="py-8 text-center">
              <p className="text-4xl mb-4">🎉</p>
              <h3 className="type-card-title text-boca-gold mb-2">
                ¡{importedCount} {importedCount === 1 ? 'partido importado' : 'partidos importados'}!
              </h3>
              <p className="type-body text-text-muted mb-6">Tu historial ya está actualizado.</p>
              <Button variant="primary" onClick={onClose}>
                Ver mi historial
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
