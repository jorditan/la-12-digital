import { RotateCcw, Share2, Check } from 'lucide-react';
import { useState } from 'react';

interface Resumen11HeaderProps {
  assignedCount: number;
  averageAge: number;
  formationLabel: string;
  onClear: () => void;
  onShare: () => void;
}

export function Resumen11Header({
  assignedCount,
  averageAge,
  formationLabel,
  onClear,
  onShare,
}: Resumen11HeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleShareClick = () => {
    onShare();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-boca-blue-mid border border-boca-border rounded-sm overflow-hidden mb-2 sm:mb-4 shadow-card">
      <div className="border-b border-boca-border-card px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-3 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="type-section-title text-white">Armá tu 11 Titular</h1>
            <p className="font-sans text-xs sm:text-sm text-text-muted mt-0.5">
              Esquema táctico:{' '}
              <strong className="text-boca-gold font-semibold">{formationLabel}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {averageAge > 0 && (
            <div className="text-xs font-sans px-3 py-1.5 rounded-sm bg-boca-blue border border-boca-border-card text-text-muted">
              Promedio de edad:{' '}
              <span className="text-white font-semibold">{averageAge} años</span>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex items-center gap-2">
            {assignedCount > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="p-2 rounded-sm border border-boca-border-card bg-boca-blue text-text-muted hover:text-white hover:border-white/20 transition-colors"
                title="Limpiar alineación"
              >
                <RotateCcw size={16} />
              </button>
            )}

            <button
              type="button"
              onClick={handleShareClick}
              disabled={assignedCount === 0}
              className={`
                px-4 py-2 rounded-sm text-sm font-sans font-bold flex items-center gap-2 transition-all
                ${
                  assignedCount > 0
                    ? 'bg-boca-gold text-boca-blue hover:opacity-90 shadow-sm'
                    : 'bg-white/10 text-text-muted cursor-not-allowed'
                }
              `}
            >
              {copied ? <Check size={16} /> : <Share2 size={16} />}
              <span>{copied ? '¡Copiado!' : 'Compartir 11'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
