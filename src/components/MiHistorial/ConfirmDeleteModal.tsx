import { useEffect, useRef } from 'react';
import { Button } from '../ui/Button';

interface ConfirmDeleteModalProps {
  rival: string;
  matchDate: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDeleteModal = ({
  rival,
  matchDate,
  onConfirm,
  onClose,
}: ConfirmDeleteModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-overlay flex items-end justify-center p-0 sm:items-center sm:px-4"
      style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="relative w-full max-w-none bg-boca-blue-light border border-boca-border rounded-t-2xl sm:rounded-sm p-6 shadow-2xl animate-fade-in flex flex-col sm:max-w-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />
        <h2 className="type-card-title text-white mb-1">¿Eliminar este registro?</h2>

        <div className="flex flex-col gap-4 mb-6">
          <p className="type-caption text-text-muted">
            Boca vs {rival}
            <span className="text-text-muted/50 mx-1">·</span>
            {matchDate}
          </p>

          <p className="type-caption text-text-muted">
            Al eliminar un registro, se borrará de tu historial.{' '}
            <b className="text-white font-semibold">Esta acción no se puede deshacer</b>. Si deseas
            volver a agregarlo, tendrás que hacerlo manualmente.
          </p>
        </div>

        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Si, eliminar
          </Button>
        </div>
      </div>
    </div>
  );
};
