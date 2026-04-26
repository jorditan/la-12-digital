import { X } from "lucide-react";
import { Button } from "../ui/Button";
import { Tab } from "../ui/Tab";
import { Modal } from "../ui/Modal";
import { PasswordInput } from "../ui/PasswordInput";
import { useAuthModal } from "./useAuthModal";

interface AuthModalProps {
  onLogin: (email: string, password: string) => Promise<{ error?: string }>;
  onRegister: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  onClose: () => void;
}

export function AuthModal({ onLogin, onRegister, onClose }: AuthModalProps) {
  const modeOptions = [
    { value: "login", label: "Iniciar sesión" },
    { value: "register", label: "Registrarse" },
  ] as const;

  const {
    email,
    setEmail,
    password,
    setPassword,
    displayName,
    setDisplayName,
    showPassword,
    setShowPassword,
    mode,
    setMode,
    loading,
    localError,
    handleSubmit,
  } = useAuthModal({ onLogin, onRegister, onClose });

  return (
    <Modal
      onClose={onClose}
      ariaLabel="Acceso a La 12 Digital"
      backdrop="rgba(0,0,0,0.75)"
      panelClassName="sm:max-w-sm border-boca-border overflow-y-auto"
    >
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-text-muted hover:text-text-nav"
        aria-label="Cerrar"
      >
        <X size={18} />
      </Button>

      <div className="px-5 pb-5 pt-4 sm:p-8">
        <div className="text-center mb-6">
          <img
            src="/escudo_boca.png"
            alt="Boca Juniors"
            width={40}
            height={39}
            className="mx-auto mb-3 object-contain"
          />
          <p className="type-section-title text-boca-gold">La 12 Digital</p>
          <p className="type-body text-text-muted mt-1">
            {mode === "login"
              ? "Iniciá sesión para registrar tu historial"
              : "Creá tu cuenta"}
          </p>
        </div>

        <Tab
          options={modeOptions}
          value={mode}
          onChange={setMode}
          fullWidth
          className="mb-5"
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "register" && (
            <div>
              <label className="type-body text-text-nav block mb-1">
                Nombre de usuario
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                minLength={2}
                maxLength={32}
                autoFocus
                className="w-full bg-boca-blue border border-boca-border rounded-sm px-3 py-2 type-body text-white focus-visible:outline-none focus-visible:border-boca-gold focus-visible:ring-1 focus-visible:ring-boca-gold/50 transition-colors"
                placeholder="Ej: xeneize1905"
              />
            </div>
          )}

          <div>
            <label className="type-body text-text-nav block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus={mode === "login"}
              className="w-full bg-boca-blue border border-boca-border rounded-sm px-3 py-2 type-body text-white focus-visible:outline-none focus-visible:border-boca-gold focus-visible:ring-1 focus-visible:ring-boca-gold/50 transition-colors"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="type-body text-text-nav block mb-1">
              Contraseña
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === "register" ? 8 : 1}
              show={showPassword}
              onToggleShow={() => setShowPassword((v) => !v)}
              placeholder={mode === "register" ? "Mínimo 8 caracteres" : "••••••••"}
              hint={
                mode === "register" &&
                password.length > 0 &&
                password.length < 8 ? (
                  <p className="type-caption text-text-muted">
                    {8 - password.length} caracteres más
                  </p>
                ) : null
              }
            />
          </div>

          {localError && (
            <p
              role="alert"
              className="type-body text-status-negative text-center border border-status-negative/30 rounded-sm px-3 py-2 bg-status-negative/5"
            >
              {localError}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            className="w-full py-2.5"
          >
            {loading
              ? "Cargando…"
              : mode === "login"
                ? "Entrar"
                : "Crear cuenta"}
          </Button>
        </form>
      </div>
    </Modal>
  );
}
