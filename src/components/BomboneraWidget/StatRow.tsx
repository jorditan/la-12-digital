import type { ReactNode } from 'react';

export function StatRow({
  label,
  value,
  warn = false,
}: {
  label: string;
  value: ReactNode;
  warn?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-3 flex-1">
      <p className="type-ui-label font-serif text-text-secondary text-sm tracking-[0.06em]">
        {label}
      </p>
      <p
        className={`font-bold leading-none text-[0.9rem] font-sans ${warn ? 'text-status-negative' : 'text-white'}`}
      >
        {value}
      </p>
    </div>
  );
}
