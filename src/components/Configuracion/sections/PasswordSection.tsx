import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "../../ui/Button";
import { SectionCard } from "../../ui/SectionCard";
import { ErrorMessage } from "../../ui/ErrorMessage";
import { PasswordInput } from "../../ui/PasswordInput";

function translateError(msg: string): string {
  if (msg.includes("Password should be at least"))
    return "La contraseña debe tener al menos 8 caracteres.";
  if (msg.includes("Auth session missing"))
    return "Tu sesión expiró. Volvé a iniciar sesión.";
  return msg;
}

interface PasswordSectionProps {
  onUpdatePassword: (password: string) => Promise<{ error?: string }>;
}

export function PasswordSection({ onUpdatePassword }: PasswordSectionProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mismatch = confirm.length > 0 && password !== confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setError("Mínimo 8 caracteres.");
      return;
    }
    setError(null);
    setLoading(true);
    const result = await onUpdatePassword(password);
    setLoading(false);
    if (result.error) {
      setError(translateError(result.error));
    } else {
      toast.success("Contraseña actualizada");
      setPassword("");
      setConfirm("");
    }
  };

  return (
    <SectionCard title="Contraseña">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="type-body text-text-muted block mb-1.5">
            Nueva contraseña
          </label>
          <PasswordInput
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            show={showPw}
            onToggleShow={() => setShowPw((v) => !v)}
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            hint={
              password.length > 0 && password.length < 8 ? (
                <p className="type-caption text-text-muted">
                  {8 - password.length} caracteres más
                </p>
              ) : null
            }
          />
        </div>

        <div>
          <label className="type-body text-text-muted block mb-1.5">
            Confirmar contraseña
          </label>
          <input
            type={showPw ? "text" : "password"}
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setError(null);
            }}
            placeholder="Repetí la contraseña"
            className={[
              "w-full bg-boca-blue border rounded-sm px-3 py-2 type-body text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-boca-gold/50 transition-colors",
              mismatch
                ? "border-status-negative focus-visible:border-status-negative"
                : "border-boca-border focus-visible:border-boca-gold",
            ].join(" ")}
          />
          {mismatch && (
            <p className="type-caption text-status-negative mt-1">
              Las contraseñas no coinciden
            </p>
          )}
        </div>

        <ErrorMessage msg={error} />
        <Button
          type="submit"
          variant="primary"
          disabled={loading || !password || !confirm || mismatch || password.length < 8}
          className="px-5 py-2"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Cambiar contraseña
        </Button>
      </form>
    </SectionCard>
  );
}
