import { useEffect } from "react";

/**
 * Efectos secundarios del modal:
 * - Bloquea el scroll del body mientras está montado.
 * - Cierra el modal al presionar Escape.
 */
export function useModalEffects(onClose: () => void) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);
}
