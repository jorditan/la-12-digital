import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Button } from '../Button';
import { useClickOutside } from '../../../hooks/useClickOutside';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectDropdownProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SelectDropdown({ options, value, onChange, className }: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const selected = options.find(o => o.value === value);

  function select(option: SelectOption) {
    onChange(option.value);
    setOpen(false);
  }

  return (
    <div ref={ref} className={`relative inline-block ${className ?? ''}`}>
      <Button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        variant="ghost"
        size="sm"
        className={[
          'w-full border',
          open
            ? 'bg-boca-gold/10 border-boca-gold/60 text-boca-gold'
            : 'bg-boca-blue border-boca-gold/30 text-boca-gold hover:border-boca-gold/55 hover:bg-boca-gold/5 focus-visible:ring-2 focus-visible:ring-boca-gold/40 focus-visible:outline-none',
        ].join(' ')}
      >
        <span className="flex-1 text-left truncate">{selected?.label ?? value}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </Button>

      {open && (
        <ul
          role="listbox"
          className={[
            'absolute left-0 top-full mt-1 z-20 min-w-full',
            'bg-boca-blue border border-boca-gold/20 rounded-sm',
            'shadow-[0_8px_24px_rgba(0,0,0,0.45)]',
            'overflow-hidden',
          ].join(' ')}
        >
          {options.map(option => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => select(option)}
                className={[
                  'flex items-center justify-between gap-3 px-3 py-2',
                  'font-sans text-sm cursor-pointer whitespace-nowrap',
                  'transition-colors duration-100',
                  isSelected
                    ? 'bg-boca-gold/15 text-boca-gold'
                    : 'text-white/70 hover:bg-boca-gold/8 hover:text-white',
                ].join(' ')}
              >
                <span>{option.label}</span>
                {isSelected && <Check size={13} className="text-boca-gold shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
