import { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { QuickFilter } from './QuickFilter';
import { useClickOutside } from '../../hooks/useClickOutside';

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export const MultiSelect = ({ options, selected, onChange, placeholder = 'Seleccioná' }: MultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false));

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value]);
  };

  const selectAll = () => onChange([...options]);
  const clearAll  = () => onChange([]);

  const label = selected.length === 0
    ? placeholder
    : selected.length === 1
      ? selected[0]
      : `${selected.length} competencias`;

  const isActive = selected.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <QuickFilter
        onClick={() => setOpen(o => !o)}
        active={isActive}
        aria-expanded={open}
        aria-haspopup="listbox"
        badge={isActive ? (
          <span className="w-4 h-4 rounded-full bg-boca-gold text-boca-blue type-ui-label flex items-center justify-center shrink-0" style={{ fontSize: '9px' }}>
            {selected.length}
          </span>
        ) : undefined}
      >
        <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
          <path d="M4 7h6M4 4.5h6M4 9.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span className="max-w-[140px] truncate">{label}</span>
        <svg viewBox="0 0 10 6" fill="none" className={['w-2.5 h-2.5 shrink-0 transition-transform', open ? 'rotate-180' : ''].join(' ')}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </QuickFilter>

      {open && options.length > 0 && (
        <div className="absolute left-0 top-full mt-1 min-w-[200px] bg-boca-blue border border-boca-border rounded-sm shadow-xl z-50 overflow-hidden animate-fade-in">
          <ul role="listbox" aria-multiselectable="true">
            {options.map(opt => (
              <li key={opt}>
                <Button
                  type="button"
                  role="option"
                  aria-selected={selected.includes(opt)}
                  onClick={() => toggle(opt)}
                  variant="ghost"
                  className="w-full justify-start text-left px-3 py-2.5 type-caption text-text-nav hover:bg-boca-blue-mid border-b border-boca-border/30 last:border-0"
                >
                  <span className={[
                    'w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 transition-colors',
                    selected.includes(opt) ? 'bg-boca-gold border-boca-gold' : 'border-boca-border',
                  ].join(' ')}>
                    {selected.includes(opt) && (
                      <svg viewBox="0 0 10 8" fill="none" className="w-2.5 h-2">
                        <path d="M1 4l2.5 2.5L9 1" stroke="#001529" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="truncate">{opt}</span>
                </Button>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between px-3 py-2 border-t border-boca-border/60 bg-boca-blue-mid/40">
            <Button
              type="button"
              onClick={selectAll}
              disabled={selected.length === options.length}
              variant="text"
              size="xs"
              className="type-caption text-text-muted hover:text-boca-gold disabled:opacity-30"
            >
              Seleccionar todo
            </Button>
            <Button
              type="button"
              onClick={clearAll}
              disabled={selected.length === 0}
              variant="text"
              size="xs"
              className="type-caption text-text-muted hover:text-[#fca5a5] disabled:opacity-30"
            >
              Limpiar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
