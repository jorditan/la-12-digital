import { ChevronUp } from "lucide-react";
import { Button } from "../../ui/Button";

type MobileSidebarButtonProps = {
  onClick: () => void;
};

export function MobileSidebarButton({ onClick }: MobileSidebarButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      aria-label="Ver tabla de posiciones"
      className="fixed bottom-5 right-5 z-40 border-boca-gold/40 bg-boca-blue-mid/95 px-4 py-3 text-white shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-sm"
    >
      <span className="flex items-center gap-2">
        <span className="flex flex-col items-start leading-none">
          <span className="font-serif font-semibold  text-[14px]">
            Ver posiciones
          </span>
        </span>
        <ChevronUp size={16} className="text-boca-gold/90" />
      </span>
    </Button>
  );
}
