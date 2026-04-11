import { useState, useRef, useCallback } from 'react';
import type { MatchResult } from '@/services/apifootball';
import { Button } from '../ui/Button';
import { formatOptionLabel } from './useMiHistorial';
import { useClickOutside } from '../../hooks/useClickOutside';

interface MatchComboboxProps {
  matches: MatchResult[];
  value: string;
  onChange: (id: string) => void;
}

export const MatchCombobox = ({ matches, value, onChange }: MatchComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedMatch = matches.find(m => m.fixtureId.toString() === value);
  const displayValue = selectedMatch ? formatOptionLabel(selectedMatch) : '';
  const filtered = query.trim()
    ? matches.filter(m => formatOptionLabel(m).toLowerCase().includes(query.toLowerCase()))
    : matches;

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  useClickOutside(containerRef, handleClose);

  const handleSelect = (id: string) => {
    onChange(id);
    handleClose();
  };

  const handleInputClick = () => {
    setOpen(true);
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <div
        className={['flex items-center bg-boca-blue border rounded-sm cursor-text', open ? 'border-boca-gold' : value ? 'border-boca-gold/60' : 'border-boca-border'].join(' ')}
        onClick={handleInputClick}
      >
        {open ? (
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') handleClose();
              if (e.key === 'Enter' && filtered.length > 0) handleSelect(filtered[0].fixtureId.toString());
            }}
            placeholder="Buscá por rival o fecha..."
            className="flex-1 bg-transparent px-3 py-2.5 type-body text-white focus:outline-none placeholder:text-text-muted/50"
          />
        ) : (
          <span className={['flex-1 px-3 py-2.5 type-body truncate', value ? 'text-text-nav' : 'text-text-muted'].join(' ')}>
            {value ? displayValue : (matches.length === 0 ? 'Todos los partidos ya registrados' : 'Seleccioná un partido...')}
          </span>
        )}
        <div className="pr-2.5 shrink-0">
          <svg viewBox="0 0 10 6" fill="none" className={['w-2.5 h-2.5 transition-transform', open ? 'rotate-180 text-boca-gold' : 'text-text-muted'].join(' ')}>
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-boca-blue border border-boca-border rounded-sm shadow-lg z-50 max-h-56 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-3 py-2.5 type-body text-text-muted/70 italic">Sin resultados</p>
          ) : (
            filtered.map(match => (
              <Button
                key={match.fixtureId}
                type="button"
                onClick={() => handleSelect(match.fixtureId.toString())}
                variant="ghost"
                className="w-full justify-start text-left px-3 py-2.5 type-body text-text-nav hover:bg-boca-blue-mid hover:text-white border-b border-boca-border/30 last:border-0"
              >
                {formatOptionLabel(match)}
              </Button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
