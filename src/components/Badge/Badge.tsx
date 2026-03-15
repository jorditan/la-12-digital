import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'blue' | 'gold' | 'local' | 'visitante';
  children: ReactNode;
  className?: string;
}

const VARIANTS = {
  blue:      'bg-[#003d7a] text-white',
  gold:      'bg-boca-blue text-boca-gold',
  local:     'bg-green-900/50 text-green-300 border border-green-700/60',
  visitante: 'bg-[#00396e]/60 text-blue-200 border border-[#00396e]',
};

export function Badge({ variant = 'blue', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`type-ui-label inline-flex items-center px-2.5 py-1 rounded-sm ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
