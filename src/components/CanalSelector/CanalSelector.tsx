import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { CanalYoutube } from '../../data/canalesYoutube';

interface CanalSelectorProps {
  canales: CanalYoutube[];
  selected: CanalYoutube;
  onChange: (canal: CanalYoutube) => void;
}

export function CanalSelector({ canales, selected, onChange }: CanalSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  function select(canal: CanalYoutube) {
    onChange(canal);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative inline-block">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={[
          'flex items-center gap-2 font-sans text-sm px-3 py-1.5 rounded-sm',
          'border transition-colors duration-150',
          open
            ? 'bg-boca-gold/10 border-boca-gold/60 text-boca-gold'
            : 'bg-boca-blue border-boca-gold/30 text-boca-gold hover:border-boca-gold/55 hover:bg-boca-gold/5',
        ].join(' ')}
      >
        <span>{selected.label}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <ul
          role="listbox"
          aria-label="Seleccionar canal"
          className={[
            'absolute left-0 top-full mt-1 z-20 min-w-full',
            'bg-boca-blue border border-boca-gold/20 rounded-sm',
            'shadow-[0_8px_24px_rgba(0,0,0,0.45)]',
            'overflow-hidden',
          ].join(' ')}
        >
          {canales.map(canal => {
            const isSelected = canal.id === selected.id;
            return (
              <li
                key={canal.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => select(canal)}
                className={[
                  'flex items-center justify-between gap-3 px-3 py-2',
                  'font-sans text-sm cursor-pointer whitespace-nowrap',
                  'transition-colors duration-100',
                  isSelected
                    ? 'bg-boca-gold/15 text-boca-gold'
                    : 'text-white/70 hover:bg-boca-gold/8 hover:text-white',
                ].join(' ')}
              >
                <span>{canal.label}</span>
                {isSelected && <Check size={13} className="text-boca-gold shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
