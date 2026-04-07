import { useEffect, useRef } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { Button } from '../Button';
import { Tab } from '../Tab';
import { useAuthModal } from './useAuthModal';

interface AuthModalProps {
  onLogin: (email: string, password: string) => Promise<{ error?: string }>;
  onRegister: (email: string, password: string, displayName: string) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  onClose: () => void;
}

export function AuthModal({ onLogin, onRegister, onClose }: AuthModalProps) {
  const modeOptions = [
    { value: 'login', label: 'Iniciar sesión' },
    { value: 'register', label: 'Registrarse' },
  ] as const;

  const overlayRef = useRef<HTMLDivElement>(null);
  const {
    email, setEmail,
    password, setPassword,
    displayName, setDisplayName,
    showPassword, setShowPassword,
    mode, setMode,
    loading,
    localError,
    handleSubmit,
  } = useAuthModal({ onLogin, onRegister, onClose });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:px-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative w-full max-w-none bg-boca-blue-light border border-boca-border rounded-t-2xl sm:rounded-sm shadow-2xl max-h-[88dvh] sm:max-w-sm overflow-y-auto">
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

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
            <img src="/escudo_boca.png" alt="Boca Juniors" width={40} height={39} className="mx-auto mb-3 object-contain" />
            <p className="type-section-title text-boca-gold">La 12 Digital</p>
            <p className="type-body text-text-muted mt-1">
              {mode === 'login' ? 'Iniciá sesión para registrar tu historial' : 'Creá tu cuenta'}
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

            {mode === 'register' && (
              <div>
                <label className="type-body text-text-nav block mb-1">Nombre de usuario</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={32}
                  autoFocus
                  className="w-full bg-boca-blue border border-boca-border rounded-sm px-3 py-2 type-body text-white focus:outline-none focus:border-boca-gold transition-colors"
                  placeholder="Ej: xeneize1905"
                />
              </div>
            )}

            <div>
              <label className="type-body text-text-nav block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus={mode === 'login'}
                className="w-full bg-boca-blue border border-boca-border rounded-sm px-3 py-2 type-body text-white focus:outline-none focus:border-boca-gold transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="type-body text-text-nav block mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={mode === 'register' ? 8 : 1}
                  className="w-full bg-boca-blue border border-boca-border rounded-sm px-3 py-2 pr-10 type-body text-white focus:outline-none focus:border-boca-gold transition-colors"
                  placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : '••••••••'}
                />
                <Button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  variant="ghost"
                  size="icon"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-nav"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              {mode === 'register' && password.length > 0 && password.length < 8 && (
                <p className="type-caption text-text-muted mt-1">
                  {8 - password.length} caracteres más
                </p>
              )}
            </div>

            {localError && (
              <p className="type-body text-status-negative text-center border border-status-negative/30 rounded-sm px-3 py-2 bg-status-negative/5">
                {localError}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full py-2.5"
            >
              {loading ? 'Cargando…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
