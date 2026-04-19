interface DateQuickFilterProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  label: string;
  onClear?: () => void;
}

export const DateQuickFilter = ({
  active = false,
  label,
  onClear,
  className = "",
  type = "button",
  ...props
}: DateQuickFilterProps) => {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center gap-2 px-3 py-2 rounded-sm border type-caption whitespace-nowrap",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boca-gold focus-visible:ring-offset-1 focus-visible:ring-offset-boca-blue",
        active
          ? "bg-boca-gold/10 border-boca-gold/60 text-boca-gold"
          : "bg-boca-blue border-boca-border text-text-muted hover:border-boca-gold/40 hover:text-text-nav",
        className,
      ].join(" ")}
      {...props}
    >
      <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0">
        <rect
          x="1"
          y="2"
          width="12"
          height="11"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path
          d="M4 1v2M10 1v2M1 6h12"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
      <span className="max-w-[200px] truncate">{label}</span>
      {active && onClear && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClear();
            }
          }}
          className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity leading-none cursor-pointer"
          aria-label="Limpiar fechas"
        >
          ×
        </span>
      )}
    </button>
  );
};
