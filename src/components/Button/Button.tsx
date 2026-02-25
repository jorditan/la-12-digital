import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
  /** Fondo dorado, texto azul oscuro — acción principal */
  primary: [
    'bg-boca-gold text-boca-blue font-semibold',
    'border border-boca-gold',
    'hover:bg-boca-gold-dark hover:border-boca-gold-dark',
    'active:brightness-90',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),

  /** Contorno dorado, texto dorado — acción secundaria */
  secondary: [
    'bg-transparent text-boca-gold font-semibold',
    'border border-boca-gold',
    'hover:bg-boca-gold/10',
    'active:bg-boca-gold/20',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),

  /** Sin borde, texto dorado — acción terciaria / sutil */
  ghost: [
    'bg-transparent text-boca-gold font-medium',
    'border border-transparent',
    'hover:border-boca-gold/25 hover:bg-boca-gold/5',
    'active:bg-boca-gold/10',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),

  /** Fondo rojo — acción destructiva */
  destructive: [
    'bg-red-800 text-white font-semibold',
    'border border-red-800',
    'hover:bg-red-700 hover:border-red-700',
    'active:brightness-90',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-sm',
  md: 'px-4 py-2 text-sm rounded-sm',
  lg: 'px-6 py-3 text-base rounded-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2',
        'font-sans cursor-pointer',
        'transition-colors duration-150',
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
