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
      className="fixed inset-0 z-overlay flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-xs bg-boca-blue-light border border-boca-border rounded-sm p-6 shadow-2xl animate-fade-in">
        <h2 className="type-card-title text-white mb-1">¿Eliminar este registro?</h2>
        <p className="type-caption text-text-muted mb-6">
          Boca vs {rival}
          <span className="text-text-muted/50 mx-1">·</span>
          {matchDate}
        </p>

        <div className="flex gap-3 justify-end">
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
