// src/components/MiHistorial/ImportModal.tsx
import { useRef } from 'react';
import { Upload, Download, X } from 'lucide-react';
import { Button } from '../ui/Button';
import type { MatchResult } from '@/services/apifootball';
import type { UpsertAttendancePayload } from '@/types/attendance';
import { useImportModal } from './useImportModal';
import { PreviewRow } from './ImportPreview';

interface ImportModalProps {
  matches: MatchResult[];
  existingMatchIds: string[];
  upsert: (payload: UpsertAttendancePayload) => Promise<void>;
  onClose: () => void;
}

export const ImportModal = ({ matches, existingMatchIds, upsert, onClose }: ImportModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  const {
    step,
    errors,
    enriched,
    progress,
    total,
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
      className="fixed inset-0 z-overlay flex items-end justify-center p-0 sm:items-center sm:px-4"
      style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-none bg-boca-blue-light border border-boca-border rounded-t-2xl sm:rounded-sm shadow-2xl animate-fade-in overflow-hidden max-h-[88dvh] sm:max-w-2xl sm:max-h-none flex flex-col">
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1 sm:hidden" />
        
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

        <div className="p-6 text-left overflow-y-auto">
          {/* ── idle ── */}
          {step === 'idle' && (
            <>
              <p className="type-body text-text-muted mb-5">
                <b className="text-white">
                  Descargá la plantilla, completala y después volvé a cargarla
                </b>{' '}
                . Añadirás partidos a tu historial de forma masiva, el sistema identificará
                automáticamente los resultados y competencias.
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
                  <span className="text-boca-gold font-bold">hacé clic para subirlo</span>
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
                  {errors.map((e) => (
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
                      {enriched
                        .filter((r) => r.status === 'found')
                        .map((r) => (
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
                      {enriched
                        .filter((r) => r.status === 'not_found')
                        .map((r) => (
                          <PreviewRow key={r.rowIndex} row={r} />
                        ))}
                    </div>
                  </div>
                )}

                {duplicateCount > 0 && (
                  <div className="pt-2">
                    <p className="type-caption text-text-muted/60 font-bold mb-2 uppercase tracking-wider text-[11px]">
                      Ya registrados ({duplicateCount})
                    </p>
                    <div className="bg-black/10 rounded-sm px-3 py-1 opacity-60">
                      {enriched
                        .filter((r) => r.status === 'duplicate')
                        .map((r) => (
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

              <div className="flex justify-end items-center gap-4">
                <Button variant="outline" onClick={onClose} className="px-6 font-medium">
                  Cancelar
                </Button>

                <Button
                  variant="primary"
                  onClick={handleImport}
                  disabled={foundCount + notFoundCount === 0}
                  className="font-bold px-8"
                >
                  Añadir partidos
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
