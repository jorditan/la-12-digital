import { useState, useEffect, useRef } from 'react';
import { Button } from '../Button';
import { DateQuickFilter } from './DateQuickFilter';

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS_ES   = ['Lu','Ma','Mi','Ju','Vi','Sa','Do'];

const toDateStr = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

const todayStr = toDateStr(new Date());

const formatDisplay = (s: string) =>
  new Date(s + 'T12:00:00').toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit', year:'numeric' });

// ── Types ─────────────────────────────────────────────────────────────────────

interface DateRangePickerProps {
  from: string | null;
  to: string | null;
  onChange: (from: string | null, to: string | null) => void;
}

// ── Day state helper ──────────────────────────────────────────────────────────

const getDayState = (
  dateStr: string,
  from: string | null,
  to: string | null,
  hover: string | null,
) => {
  const isFuture  = dateStr > todayStr;
  const isToday   = dateStr === todayStr;
  const isStart   = dateStr === from;
  const isEnd     = dateStr === to;
  const inConfirmed = !!(from && to && dateStr > from && dateStr < to);

  // Hover preview: only active while from is set and to is not
  let inHover = false, isHoverAnchor = false, isHoverTip = false;
  if (from && !to && hover && hover !== from) {
    const lo = from < hover ? from : hover;
    const hi = from < hover ? hover : from;
    inHover      = dateStr > lo && dateStr < hi;
    isHoverAnchor = dateStr === lo;
    isHoverTip    = dateStr === hi;
  }

  return { isFuture, isToday, isStart, isEnd, inConfirmed, inHover, isHoverAnchor, isHoverTip };
};

// ── Main component ────────────────────────────────────────────────────────────

export const DateRangePicker = ({ from, to, onChange }: DateRangePickerProps) => {
  const today = new Date();
  const [open, setOpen]           = useState(false);
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [hover, setHover]         = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // When opening, jump to the month of 'from' (or today)
  const handleToggle = () => {
    if (!open) {
      if (from) {
        const d = new Date(from + 'T12:00:00');
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      } else {
        setViewYear(today.getFullYear());
        setViewMonth(today.getMonth());
      }
    }
    setOpen(o => !o);
  };

  // Month navigation
  const isAtMax = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y-1); setViewMonth(11); }
    else setViewMonth(m => m-1);
  };
  const nextMonth = () => {
    if (isAtMax) return;
    if (viewMonth === 11) { setViewYear(y => y+1); setViewMonth(0); }
    else setViewMonth(m => m+1);
  };

  // Day click
  const handleDayClick = (dateStr: string) => {
    if (dateStr > todayStr) return;
    if (!from || (from && to)) {
      onChange(dateStr, null);
    } else if (dateStr === from) {
      onChange(null, null);
    } else if (dateStr < from) {
      onChange(dateStr, from);
    } else {
      onChange(from, dateStr);
    }
  };

  // Quick presets
  const setThisYear = () => {
    onChange(`${today.getFullYear()}-01-01`, todayStr);
    setOpen(false);
  };
  const setLast12 = () => {
    const d = new Date(today);
    d.setFullYear(d.getFullYear() - 1);
    onChange(toDateStr(d), todayStr);
    setOpen(false);
  };
  const clearAll = () => onChange(null, null);

  // Calendar grid
  const daysInMonth   = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Mon=0
  const totalCells    = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;

  // Trigger label
  const isActive = !!(from || to);
  const triggerLabel = from && to
    ? `${formatDisplay(from)} → ${formatDisplay(to)}`
    : from
    ? `Desde ${formatDisplay(from)}`
    : 'Seleccioná un período';

  return (
    <div ref={containerRef} className="relative">

      {/* ── Trigger ─────────────────────────────────────────────────────────── */}
      <DateQuickFilter
        onClick={handleToggle}
        active={isActive}
        label={triggerLabel}
        onClear={clearAll}
        aria-expanded={open}
        aria-haspopup="dialog"
      />

      {/* ── Calendar dropdown ────────────────────────────────────────────────── */}
      {open && (
        <div
          role="dialog"
          aria-label="Seleccionar rango de fechas"
          className="absolute left-0 top-full mt-1 bg-boca-blue border border-boca-border rounded-sm shadow-xl z-50 animate-fade-in"
          style={{ width: 284 }}
        >

          {/* Month nav */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-boca-border/60">
            <Button
              type="button"
              onClick={prevMonth}
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-text-muted hover:text-boca-gold hover:bg-boca-blue-mid"
              aria-label="Mes anterior"
            >
              <svg viewBox="0 0 8 12" fill="none" className="w-2 h-3">
                <path d="M6 1L2 6l4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>

            <span className="type-body font-medium text-text-nav">
              {MONTHS_ES[viewMonth]} {viewYear}
            </span>

            <Button
              type="button"
              onClick={nextMonth}
              disabled={isAtMax}
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-text-muted hover:text-boca-gold hover:bg-boca-blue-mid disabled:opacity-25"
              aria-label="Mes siguiente"
            >
              <svg viewBox="0 0 8 12" fill="none" className="w-2 h-3">
                <path d="M2 1l4 5-4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
          </div>

          {/* Selection hint */}
          <div className="px-4 pt-2.5 pb-0">
            <p className="type-ui-label text-text-muted/50 text-center tracking-wide">
              {!from
                ? 'SELECCIONÁ LA FECHA DE INICIO'
                : !to
                ? 'AHORA SELECCIONÁ LA FECHA FINAL'
                : 'RANGO SELECCIONADO'}
            </p>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 px-3 pt-2 pb-1">
            {DAYS_ES.map(d => (
              <div key={d} className="h-7 flex items-center justify-center type-ui-label text-text-muted/50">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div
            className="grid grid-cols-7 px-3 pb-2"
            onMouseLeave={() => setHover(null)}
          >
            {Array.from({ length: totalCells }, (_, i) => {
              const dayNum = i - firstDayOfWeek + 1;
              if (dayNum < 1 || dayNum > daysInMonth) return <div key={`empty-${i}`} className="h-8" />;

              const dateStr = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
              const {
                isFuture, isToday, isStart, isEnd,
                inConfirmed, inHover, isHoverAnchor, isHoverTip,
              } = getDayState(dateStr, from, to, hover);

              const isSelectedEndpoint  = isStart || isEnd;
              const isHoverEndpoint     = isHoverAnchor || isHoverTip;
              const hasConfirmedRangeBg = inConfirmed || (isStart && !!to) || (isEnd && !!from);
              const hasHoverRangeBg     = inHover || isHoverAnchor || isHoverTip;

              // Half-side background for range endpoints
              const bgSide = (() => {
                if (isStart && to)   return 'left-1/2 right-0';
                if (isEnd && from)   return 'left-0 right-1/2';
                if (isHoverAnchor)   return 'left-1/2 right-0';
                if (isHoverTip)      return 'left-0 right-1/2';
                return 'left-0 right-0';
              })();

              return (
                <div
                  key={dateStr}
                  className="relative h-8 flex items-center justify-center"
                  onMouseEnter={() => !isFuture && setHover(dateStr)}
                >
                  {/* Range background strip */}
                  {(hasConfirmedRangeBg || hasHoverRangeBg) && (
                    <div className={[
                      'absolute inset-y-1',
                      hasConfirmedRangeBg ? 'bg-boca-gold/20' : 'bg-boca-gold/10',
                      bgSide,
                    ].join(' ')} />
                  )}

                  {/* Day button */}
                  <Button
                    type="button"
                    disabled={isFuture}
                    onClick={() => handleDayClick(dateStr)}
                    variant="ghost"
                    size="icon"
                    className={[
                      'relative z-10 w-7 h-7 rounded-full type-caption transition-colors',
                      isFuture
                        ? 'text-text-muted/20 cursor-not-allowed'
                        : isSelectedEndpoint || isHoverEndpoint
                        ? 'bg-boca-gold text-boca-blue font-bold cursor-pointer'
                        : inConfirmed || inHover
                        ? 'text-boca-gold hover:bg-boca-gold/20 cursor-pointer'
                        : isToday
                        ? 'text-boca-gold ring-1 ring-boca-gold/40 hover:bg-boca-gold/10 cursor-pointer'
                        : 'text-text-nav hover:bg-boca-blue-mid cursor-pointer',
                    ].join(' ')}
                    aria-label={dateStr}
                    aria-pressed={isSelectedEndpoint}
                  >
                    {dayNum}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Footer — presets + clear */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-boca-border/60">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={setThisYear}
                variant="text"
                size="xs"
                className="type-caption text-text-muted hover:text-boca-gold"
              >
                Este año
              </Button>
              <Button
                type="button"
                onClick={setLast12}
                variant="text"
                size="xs"
                className="type-caption text-text-muted hover:text-boca-gold"
              >
                Últ. 12 meses
              </Button>
            </div>
            <Button
              type="button"
              onClick={() => { clearAll(); setOpen(false); }}
              disabled={!isActive}
              variant="text"
              size="xs"
              className="type-caption text-text-muted/50 hover:text-[#fca5a5] disabled:opacity-0"
            >
              Limpiar
            </Button>
          </div>

        </div>
      )}
    </div>
  );
};
