import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  icon,
  action,
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={`border-b border-boca-border-card px-6 pt-6 pb-3 flex items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="shrink-0 text-boca-gold">{icon}</span>}
        <h2 className="type-section-title text-white">{title}</h2>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
