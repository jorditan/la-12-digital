interface QuickFilterProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  badge?: React.ReactNode;
}

export const QuickFilter = ({
  active = false,
  badge,
  className = '',
  children,
  type = 'button',
  ...props
}: QuickFilterProps) => {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center gap-2 px-3 py-2 rounded-sm border type-caption whitespace-nowrap',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boca-gold focus-visible:ring-offset-1 focus-visible:ring-offset-boca-blue',
        active
          ? 'bg-boca-gold/10 border-boca-gold/60 text-boca-gold'
          : 'bg-boca-blue border-boca-border text-text-muted hover:border-boca-gold/40 hover:text-text-nav',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
      {badge}
    </button>
  );
};

