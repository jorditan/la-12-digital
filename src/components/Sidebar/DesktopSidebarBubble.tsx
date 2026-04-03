import { ChevronLeft } from 'lucide-react';

type DesktopSidebarBubbleProps = {
  onClick: () => void;
};

export function DesktopSidebarBubble({ onClick }: DesktopSidebarBubbleProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Expandir tabla de posiciones"
      className="rounded-sm border border-boca-border bg-boca-blue-mid/95 text-text-nav hover:text-boca-gold hover:bg-boca-blue-light transition-colors flex items-center justify-center gap-2 px-3 py-2 shadow-[0_16px_40px_rgba(0,0,0,0.28)] backdrop-blur-sm"
    >
      <span className="font-serif text-[14px] ">
        Ver posiciones
      </span>
      <ChevronLeft size={16} />
    </button>
  );
}
