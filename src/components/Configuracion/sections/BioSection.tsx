import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "../../ui/Button";
import { SectionCard } from "../../ui/SectionCard";
import { ErrorMessage } from "../../ui/ErrorMessage";

interface BioSectionProps {
  onUpdateBio: (bio: string) => Promise<{ error?: string }>;
}

export function BioSection({ onUpdateBio }: BioSectionProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const remaining = 160 - value.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await onUpdateBio(value);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      toast.success("Descripción actualizada");
    }
  };

  return (
    <SectionCard
      title="Descripción"
      description="Una línea sobre vos. Aparece en tu perfil."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <div className="relative">
            <textarea
              value={value}
              onChange={(e) => {
                setValue(e.target.value.slice(0, 160));
                setError(null);
              }}
              rows={3}
              placeholder="Ej: Xeneize de toda la vida. Bombonera 77 veces."
              className="w-full bg-boca-blue border border-boca-border rounded-sm px-3 py-2 type-body text-white focus-visible:outline-none focus-visible:border-boca-gold focus-visible:ring-1 focus-visible:ring-boca-gold/50 transition-colors resize-none"
            />
            <span
              className={[
                "absolute bottom-2 right-3 type-caption",
                remaining < 20 ? "text-boca-gold" : "text-text-muted/50",
              ].join(" ")}
            >
              {remaining}
            </span>
          </div>
          <ErrorMessage msg={error} />
        </div>
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="px-5 py-2"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Guardar cambios
        </Button>
      </form>
    </SectionCard>
  );
}
