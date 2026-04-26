import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "../../ui/Button";
import { SectionCard } from "../../ui/SectionCard";
import { ErrorMessage } from "../../ui/ErrorMessage";
import type { AuthUser } from "@/types/attendance";

function translateError(msg: string): string {
  if (msg.includes("same as the old email"))
    return "El nuevo correo es igual al actual.";
  if (msg.includes("already registered")) return "Ese correo ya está en uso.";
  if (msg.includes("Auth session missing"))
    return "Tu sesión expiró. Volvé a iniciar sesión.";
  return msg;
}

interface EmailSectionProps {
  user: AuthUser | null;
  onUpdateEmail: (
    email: string,
  ) => Promise<{ error?: string; needsConfirmation?: boolean }>;
}

export function EmailSection({ user, onUpdateEmail }: EmailSectionProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || value === user?.email) return;
    setError(null);
    setLoading(true);
    const result = await onUpdateEmail(value);
    setLoading(false);
    if (result.error) {
      setError(translateError(result.error));
    } else {
      toast.info("Confirmá tu nuevo correo", {
        description: `Te enviamos un link de verificación a ${value}`,
        duration: 7000,
      });
      setValue("");
    }
  };

  return (
    <SectionCard
      title="Correo electrónico"
      description={`Correo actual: ${user?.email}`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="type-body text-text-muted block mb-1.5">
            Nuevo correo
          </label>
          <input
            type="email"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            placeholder="nuevo@email.com"
            className="w-full bg-boca-blue border border-boca-border rounded-sm px-3 py-2 type-body text-white focus-visible:outline-none focus-visible:border-boca-gold focus-visible:ring-1 focus-visible:ring-boca-gold/50 transition-colors"
          />
          <ErrorMessage msg={error} />
        </div>
        <p className="type-caption text-text-muted">
          Te enviaremos un link de confirmación al nuevo correo.
        </p>
        <Button
          type="submit"
          variant="primary"
          disabled={loading || !value || value === user?.email}
          className="px-5 py-2"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Cambiar correo
        </Button>
      </form>
    </SectionCard>
  );
}
