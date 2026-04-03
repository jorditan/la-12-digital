import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'blue' | 'gold' | 'local' | 'visitante';
  children: ReactNode;
  className?: string;
}

const VARIANTS = {
  blue:      'bg-boca-border-card text-white',
  gold:      'bg-boca-blue text-boca-gold',
  local:     'bg-status-win-subtle text-green-500 border border-status-win',
  visitante: 'bg-boca-border/60 text-text-nav border border-boca-border',
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
