import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "../../ui/Button";
import { SectionCard } from "../../ui/SectionCard";
import { ErrorMessage } from "../../ui/ErrorMessage";
import { useUsernameCheck, UsernameStatusBadge } from "../hooks/useUsernameCheck";
import type { AuthUser } from "@/types/attendance";

interface UsernameSectionProps {
  user: AuthUser | null;
  onUpdateDisplayName: (name: string) => Promise<{ error?: string }>;
}

export function UsernameSection({
  user,
  onUpdateDisplayName,
}: UsernameSectionProps) {
  const [value, setValue] = useState(user?.displayName ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const status = useUsernameCheck(value, user?.displayName ?? null);
  const canSave =
    value.trim() !== (user?.displayName ?? "") &&
    (status === "available" || status === "idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    setError(null);
    setLoading(true);
    const result = await onUpdateDisplayName(value.trim());
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      toast.success("Nombre de usuario actualizado");
    }
  };

  return (
    <SectionCard
      title="Nombre de usuario"
      description="Solo letras, números y guión bajo (_). Debe ser único."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
              }}
              minLength={2}
              maxLength={32}
              placeholder="Ej: xeneize1905"
              className="flex-1 bg-boca-blue border border-boca-border rounded-sm px-3 py-2 type-body text-white focus-visible:outline-none focus-visible:border-boca-gold focus-visible:ring-1 focus-visible:ring-boca-gold/50 transition-colors"
            />
            <UsernameStatusBadge status={status} />
          </div>
          <ErrorMessage msg={error} />
        </div>
        <Button
          type="submit"
          variant="primary"
          disabled={loading || !canSave}
          className="px-5 py-2"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Guardar cambios
        </Button>
      </form>
    </SectionCard>
  );
}
