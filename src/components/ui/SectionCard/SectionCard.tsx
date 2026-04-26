import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Shared card container used in Configuracion sections and similar settings panels.
 */
export function SectionCard({
  title,
  description,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <div
      className={[
        "bg-boca-blue-light border border-boca-border rounded-sm overflow-hidden",
        className,
      ].join(" ")}
    >
      <div className="px-5 py-4 border-b border-boca-border/60">
        <p className="type-body text-text-nav font-medium">{title}</p>
        {description && (
          <p className="type-caption text-text-muted mt-0.5">{description}</p>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
