import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface BadgeProps {
  variant?: 'blue' | 'gold' | 'local' | 'visitante';
  children: ReactNode;
  className?: string;
  selectable?: boolean;
  selected?: boolean;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

const VARIANTS = {
  blue:      'bg-boca-border-card text-white',
  gold:      'bg-boca-blue text-boca-gold',
  local:     'bg-status-win-subtle text-green-500 border border-status-win',
  visitante: 'bg-boca-border/60 text-text-nav border border-boca-border',
};

export function Badge({
  variant = 'blue',
  children,
  className = '',
  selectable = false,
  selected = false,
  onClick,
  type,
}: BadgeProps) {
  const isInteractive = typeof onClick === 'function';
  const sharedClassName = [
    'type-ui-label inline-flex items-center px-2.5 py-1 rounded-sm',
    selectable
      ? [
          'border transition-colors',
          selected
            ? 'bg-boca-gold text-boca-blue font-semibold border-boca-gold'
            : 'bg-transparent border-boca-border text-text-nav hover:border-boca-gold/50 hover:text-boca-gold',
        ].join(' ')
      : VARIANTS[variant],
    className,
  ].join(' ');

  if (isInteractive) {
    return (
      <button
        type={type ?? 'button'}
        onClick={onClick}
        aria-pressed={selectable ? selected : undefined}
        className={[
          sharedClassName,
          'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boca-gold focus-visible:ring-offset-1 focus-visible:ring-offset-boca-blue',
        ].join(' ')}
      >
        {children}
      </button>
    );
  }

  return (
    <span
      className={sharedClassName}
    >
      {children}
    </span>
  );
}
