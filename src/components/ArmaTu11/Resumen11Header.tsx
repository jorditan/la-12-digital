import { Shield, RotateCcw, Share2, Check } from 'lucide-react';
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
    <div className="relative rounded-sm overflow-hidden bg-boca-blue border border-boca-gold/30 p-6 sm:p-8 mb-6 shadow-card">
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-boca-gold/10 border border-boca-gold flex items-center justify-center shrink-0 shadow-md">
            <Shield className="w-8 h-8 sm:w-9 sm:h-9 text-boca-gold" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
              Armá tu 11 Titular
            </h1>
            <p className="text-boca-gold font-sans text-sm sm:text-base mt-0.5">
              Esquema táctico seleccionado: <strong>{formationLabel}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Insights de 11 elegidos y promedio edad */}
          <div className="flex items-center gap-6 bg-boca-blue-light px-5 py-2.5 rounded border border-white/10 shrink-0">
            <div className="text-center">
              <span className="block text-2xl font-bold font-serif text-boca-gold leading-tight">
                {assignedCount}/11
              </span>
              <span className="text-xs font-sans text-text-muted uppercase tracking-wider font-semibold">
                Titulares
              </span>
            </div>

            {averageAge > 0 && (
              <>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <span className="block text-2xl font-bold font-serif text-boca-gold leading-tight">
                    {averageAge} <span className="text-sm font-sans font-normal text-white/70">años</span>
                  </span>
                  <span className="text-xs font-sans text-text-muted uppercase tracking-wider font-semibold">
                    Promedio Edad
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-2">
            {assignedCount > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="p-2.5 rounded border border-white/10 bg-boca-blue-light text-text-muted hover:text-white hover:bg-white/10 transition-colors"
                title="Limpiar alineación"
              >
                <RotateCcw size={18} />
              </button>
            )}

            <button
              type="button"
              onClick={handleShareClick}
              disabled={assignedCount === 0}
              className={`
                px-4 py-2.5 rounded text-sm font-sans font-bold flex items-center gap-2 transition-all
                ${
                  assignedCount > 0
                    ? 'bg-boca-gold text-boca-blue hover:bg-boca-gold-hover shadow-sm'
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
