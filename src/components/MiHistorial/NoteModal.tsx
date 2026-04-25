import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/Button";

const MAX_LENGTH = 280;

interface NoteModalProps {
  matchLabel: string;
  initialNote: string | null;
  onSave: (note: string | null) => void;
  onClose: () => void;
}

export const NoteModal = ({
  matchLabel,
  initialNote,
  onSave,
  onClose,
}: NoteModalProps) => {
  const [value, setValue] = useState(initialNote ?? "");
  const overlayRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, []);

  const handleSave = () => {
    onSave(value.trim() || null);
    onClose();
  };

  const remaining = MAX_LENGTH - value.length;
  const nearLimit = remaining <= 30;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-overlay flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-sm bg-boca-blue-light border border-boca-border rounded-sm p-6 shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <h2 className="type-card-title text-white">
            {initialNote ? "Editar nota" : "Añadir nota"}
          </h2>
        </div>
        <p className="type-caption text-text-muted mb-4">{matchLabel}</p>

        {/* Textarea */}
        <div className="relative mb-4">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, MAX_LENGTH))}
            rows={4}
            placeholder="Ej: Fui con mi viejo, llovió toda la noche..."
            className="w-full bg-boca-blue border border-boca-border rounded-sm px-3 py-2.5 type-body text-white placeholder:text-text-muted/40 focus-visible:outline-none focus-visible:border-boca-gold focus-visible:ring-1 focus-visible:ring-boca-gold/50 transition-colors resize-none"
          />
          <span
            className={[
              "absolute bottom-2.5 right-3 type-caption tabular-nums pointer-events-none transition-colors",
              nearLimit ? "text-boca-gold" : "text-text-muted/40",
            ].join(" ")}
          >
            {remaining}
          </span>
        </div>

        {/* Actions */}
        <div
          className="flex gap-3 justify-end
        "
        >
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
};
