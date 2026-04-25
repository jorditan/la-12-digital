import { useState, useRef } from "react";
import { Button } from "../ui/Button";
import { DateQuickFilter } from "./DateQuickFilter";
import { useClickOutside } from "../../hooks/useClickOutside";

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DAYS_ES = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

const toDateStr = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const todayStr = toDateStr(new Date());

const formatDisplay = (s: string) =>
  new Date(s + "T12:00:00").toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
}

export const DatePicker = ({ value, onChange, label }: DatePickerProps) => {
  const today = new Date();
  const [open, setOpen] = useState(false);
  
  // Initialize view with the value's date or today
  const initialDate = value ? new Date(value + "T12:00:00") : today;
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false));

  const handleToggle = () => {
    if (!open && value) {
      const d = new Date(value + "T12:00:00");
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
    setOpen(!open);
  };

  const isAtMax = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(y => y - 1);
      setViewMonth(11);
    } else setViewMonth(m => m - 1);
  };
  
  const nextMonth = () => {
    if (isAtMax) return;
    if (viewMonth === 11) {
      setViewYear(y => y + 1);
      setViewMonth(0);
    } else setViewMonth(m => m + 1);
  };

  const handleDayClick = (dateStr: string) => {
    if (dateStr > todayStr) return;
    onChange(dateStr);
    setOpen(false);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block type-caption text-text-muted mb-1.5 tracking-wider pl-1 capitalize">
          {label}
        </label>
      )}
      <DateQuickFilter
        onClick={handleToggle}
        active={true}
        label={formatDisplay(value)}
        className="w-full justify-start py-2.5 bg-black/20 border-boca-border text-white"
        aria-expanded={open}
        aria-haspopup="dialog"
      />

      {open && (
        <div
          role="dialog"
          className="absolute left-0 top-full mt-1 bg-boca-blue border border-boca-border rounded-sm shadow-xl z-50 animate-fade-in"
          style={{ width: 280 }}
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-boca-border/60">
            <Button
              type="button"
              onClick={prevMonth}
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-text-muted hover:text-boca-gold"
            >
              <svg viewBox="0 0 8 12" fill="none" className="w-1.5 h-2.5">
                <path d="M6 1L2 6l4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
            <span className="type-caption font-bold text-text-nav">
              {MONTHS_ES[viewMonth]} {viewYear}
            </span>
            <Button
              type="button"
              onClick={nextMonth}
              disabled={isAtMax}
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-text-muted hover:text-boca-gold disabled:opacity-20"
            >
              <svg viewBox="0 0 8 12" fill="none" className="w-1.5 h-2.5">
                <path d="M2 1l4 5-4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          </div>

          <div className="grid grid-cols-7 px-2 pt-2 pb-1">
            {DAYS_ES.map(d => (
              <div key={d} className="h-6 flex items-center justify-center text-[10px] font-bold text-text-muted/40 uppercase">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 px-2 pb-2">
            {Array.from({ length: totalCells }, (_, i) => {
              const dayNum = i - firstDayOfWeek + 1;
              if (dayNum < 1 || dayNum > daysInMonth) return <div key={`e-${i}`} className="h-8" />;

              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const isSelected = dateStr === value;
              const isToday = dateStr === todayStr;
              const isFuture = dateStr > todayStr;

              return (
                <div key={dateStr} className="h-8 flex items-center justify-center">
                  <button
                    type="button"
                    disabled={isFuture}
                    onClick={() => handleDayClick(dateStr)}
                    className={[
                      "w-7 h-7 rounded-full type-caption transition-all",
                      isFuture ? "text-text-muted/20 cursor-not-allowed" :
                      isSelected ? "bg-boca-gold text-boca-blue font-bold shadow-lg scale-110" :
                      isToday ? "text-boca-gold ring-1 ring-boca-gold/40" :
                      "text-text-nav hover:bg-boca-blue-mid"
                    ].join(" ")}
                  >
                    {dayNum}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
