import { ChevronLeft } from 'lucide-react';
import { Button } from '../Button';

type DesktopSidebarBubbleProps = {
  onClick: () => void;
};

export function DesktopSidebarBubble({ onClick }: DesktopSidebarBubbleProps) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      aria-label="Expandir tabla de posiciones"
      className="border-boca-border bg-boca-blue-mid/95 text-text-nav hover:text-boca-gold hover:bg-boca-blue-light shadow-[0_16px_40px_rgba(0,0,0,0.28)] backdrop-blur-sm"
    >
      <span className="font-serif text-[14px] ">
        Ver posiciones
      </span>
      <ChevronLeft size={16} />
    </Button>
  );
}
