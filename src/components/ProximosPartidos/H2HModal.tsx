import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useModalEffects } from '../../hooks/useModalEffects';
import { useH2HModalData } from './hooks/useH2HModalData';
import { formatH2HDate, formatH2HScore, RESULT_CFG } from './utils';

interface H2HModalProps {
  onClose: () => void;
  rivalId: number;
  rivalName: string;
}

export function H2HModal({ onClose, rivalId, rivalName }: H2HModalProps) {
  useModalEffects(onClose);
  const { status, finished, summary } = useH2HModalData(rivalId);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 md:items-center md:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-none max-h-[85vh] bg-boca-blue-light border border-boca-border rounded-t-2xl shadow-2xl flex flex-col overflow-hidden md:max-w-sm md:max-h-none md:rounded-sm">
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-white/15 md:hidden" />
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-boca-gold/10">
          <div className="min-w-0">
            <p className="font-serif font-semibold text-md text-white leading-tight truncate">
              Boca vs {rivalName}
            </p>
            <small className="text-white text-sm">Resultado de los últimos partidos</small>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 flex items-center justify-center w-7 h-7 rounded-sm text-white/30 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pb-4 flex flex-col gap-4 overflow-y-auto">
          {status === 'loading' && (
            <div className="flex items-center justify-center gap-1.5 py-6">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse"
                  style={{ animationDelay: `${i * 130}ms` }}
                />
              ))}
            </div>
          )}

          {status !== 'loading' && finished.length === 0 && (
            <p className="text-sm text-white/30 text-center py-6 italic">
              Sin historial disponible entre estos equipos
            </p>
          )}

          {status !== 'loading' && finished.length > 0 && (
            <>
              {/* W / D / L counters */}
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { key: 'win', count: summary.win, label: 'Ganados' },
                    { key: 'draw', count: summary.draw, label: 'Empates' },
                    { key: 'loss', count: summary.loss, label: 'Perdidos' },
                  ] as const
                ).map(({ key, count, label }) => {
                  const cfg = RESULT_CFG[key];
                  return (
                    <div
                      key={key}
                      className={`flex flex-col items-center gap-1 rounded-sm py-2.5 border ${cfg.bg} ${cfg.border}`}
                    >
                      <span className={`font-sans font-bold text-xl leading-none ${cfg.text}`}>
                        {count}
                      </span>
                      <span className="font-sans text-xs text-white/35 uppercase tracking-wide">
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Match list */}
              <div className="flex flex-col gap-0.5">
                <p className="font-sans text-xs text-gray-200 tracking-wider mb-1">
                  Últimos {finished.length} resultado
                  {finished.length !== 1 ? 's' : ''}
                </p>
                {finished.map((m, i) => {
                  const cfg = RESULT_CFG[m.result];
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-sm border ${cfg.bg} ${cfg.border}`}
                    >
                      {/* Teams + score + competition */}
                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-sans text-sm text-white/60 truncate leading-tight">
                            {m.homeTeam} vs {m.awayTeam}
                          </span>
                        </div>
                        {m.competition && (
                          <span className="font-sans text-xs text-white/25 truncate leading-tight">
                            {m.competition}
                          </span>
                        )}
                      </div>
                      {/* Date and score */}
                      <span
                        className={`font-sans font-semibold text-xs tabular-nums shrink-0 ${cfg.text}`}
                      >
                        {formatH2HScore(m)}
                      </span>
                      <div className="shrink-0 flex items-center gap-1 text-white/25">
                        <span className="font-sans text-xs tabular-nums whitespace-nowrap">
                          {formatH2HDate(m.date)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
