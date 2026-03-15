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
      <p className="type-ui-label font-serif text-text-secondary" style={{ fontSize: '14px', letterSpacing: '0.06em' }}>
        {label}
      </p>
      <p
        className="font-bold leading-none"
        style={{
          fontSize: '0.9rem',
          fontFamily: 'Geist, sans-serif',
          color: warn ? '#f87171' : 'white',
        }}
      >
        {value}
      </p>
    </div>
  );
}
