import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'blue' | 'gold';
  children: ReactNode;
  className?: string;
}

const VARIANTS = {
  blue: 'bg-[#003d7a] text-white',
  gold: 'bg-boca-blue text-boca-gold',
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
