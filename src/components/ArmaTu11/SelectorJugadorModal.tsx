import { useState, useMemo, useRef } from 'react';
import type { SlotCoordinate } from './types';
import type { PlantelJugador } from '../Plantel/types';
import { X, Search, Check } from 'lucide-react';

interface SelectorJugadorModalProps {
  slot: SlotCoordinate;
  players: PlantelJugador[];
  assignedPlayerIds: Set<number | string>;
  onSelectPlayer: (player: PlantelJugador) => void;
  onClose: () => void;
}

export function SelectorJugadorModal({
  slot,
  players,
  assignedPlayerIds,
  onSelectPlayer,
  onClose,
}: SelectorJugadorModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');

  // Filtrar y ordenar priorizando la categoría correspondiente a la posición
  const filteredPlayers = useMemo(() => {
    return players
      .filter((p) => {
        if (!search.trim()) return true;
        const query = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(query) ||
          (p.number && p.number.includes(query))
        );
      })
      .sort((a, b) => {
        const aMatchesCat = a.positionCategory === slot.category ? 0 : 1;
        const bMatchesCat = b.positionCategory === slot.category ? 0 : 1;
        if (aMatchesCat !== bMatchesCat) return aMatchesCat - bMatchesCat;
        return a.name.localeCompare(b.name);
      });
  }, [players, search, slot.category]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:px-4"
      style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-none bg-boca-blue-light border border-boca-border rounded-t-2xl sm:rounded-sm shadow-2xl animate-fade-in overflow-hidden max-h-[88dvh] sm:max-w-lg sm:max-h-[85vh] flex flex-col">
        {/* Pill handle táctil para mobile */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        {/* Header compartido de la App */}
        <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-boca-border/60 shrink-0">
          <div>
            <h2 className="type-card-title text-boca-gold">
              Seleccionar {slot.name}
            </h2>
            <p className="font-sans text-xs text-text-muted mt-0.5">
              Posición táctica: <span className="text-white font-semibold">{slot.category.toUpperCase()}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-white transition-colors p-1"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Buscador tokenizado */}
        <div className="px-6 py-3 border-b border-boca-border/40 bg-boca-blue/30 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o número..."
              className="w-full pl-9 pr-4 py-2 bg-boca-blue border border-boca-border rounded-sm text-sm text-white placeholder-text-muted focus:outline-none focus:border-boca-gold font-sans"
            />
          </div>
        </div>

        {/* Lista de Jugadores */}
        <div className="p-6 overflow-y-auto flex flex-col gap-2.5">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((player) => {
              const isAssigned = assignedPlayerIds.has(player.id);
              const matchesPos = player.positionCategory === slot.category;

              return (
                <button
                  key={player.id}
                  onClick={() => onSelectPlayer(player)}
                  className={`
                    w-full px-4 py-3 rounded-sm border text-left flex items-center justify-between gap-3 transition-all duration-150 font-sans
                    ${
                      isAssigned
                        ? 'bg-boca-blue/40 border-white/5 opacity-70 hover:opacity-100 hover:border-boca-gold/40'
                        : matchesPos
                        ? 'bg-boca-blue border-boca-gold/40 hover:border-boca-gold hover:bg-boca-gold/10 shadow-sm'
                        : 'bg-boca-blue/60 border-boca-border/40 hover:border-white/20'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-sm bg-boca-gold/10 border border-boca-gold/20 flex items-center justify-center font-serif font-bold text-sm text-boca-gold shrink-0">
                      {player.number ? `#${player.number}` : '-'}
                    </span>
                    <div className="min-w-0">
                      <span className="block font-serif font-bold text-base text-white truncate">
                        {player.name}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <span>{player.positionLabel}</span>
                        {player.age > 0 && <span>• {player.age} años</span>}
                      </div>
                    </div>
                  </div>

                  {isAssigned && (
                    <span className="text-xs font-semibold text-boca-gold bg-boca-gold/10 px-2 py-0.5 rounded border border-boca-gold/20 shrink-0 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Titular
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <p className="text-center py-8 font-serif text-text-muted text-sm">
              No se encontraron jugadores que coincidan con la búsqueda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
