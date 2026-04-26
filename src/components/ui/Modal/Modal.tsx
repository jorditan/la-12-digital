import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { useModalEffects } from "../../../hooks/useModalEffects";

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  /** Extra classes on the inner panel, e.g. custom max-width */
  panelClassName?: string;
  /** Override the backdrop background (CSS value) */
  backdrop?: string;
  /** aria-label for the dialog element */
  ariaLabel?: string;
}

/**
 * Generic modal primitive: portal + overlay + backdrop-blur + scroll lock.
 *
 * Clicking the overlay or pressing Escape calls `onClose`.
 * Children are rendered inside the modal panel.
 */
export function Modal({
  onClose,
  children,
  panelClassName = "",
  backdrop = "var(--color-modal-backdrop)",
  ariaLabel,
}: ModalProps) {
  useModalEffects(onClose);

  return createPortal(
    <div
      className="fixed inset-0 z-overlay flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ background: backdrop, backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={[
          "relative w-full max-w-none bg-boca-blue-light border border-boca-gold/20",
          "rounded-t-2xl sm:rounded-sm overflow-hidden shadow-2xl animate-fade-in",
          "max-h-[88dvh] sm:max-h-none",
          panelClassName,
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1 sm:hidden" />
        {children}
      </div>
    </div>,
    document.body,
  );
}
