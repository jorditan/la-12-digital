import { useState, useEffect, useRef } from 'react';
import { Camera, Check, X, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { AuthUser } from '@/types/attendance';
import { Button } from '../ui/Button';

interface ConfiguracionProps {
  user: AuthUser | null;
  onUploadAvatar: (file: File) => Promise<{ error?: string }>;
  onUpdateEmail: (email: string) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  onUpdatePassword: (password: string) => Promise<{ error?: string }>;
  onUpdateDisplayName: (name: string) => Promise<{ error?: string }>;
  onUpdateBio: (bio: string) => Promise<{ error?: string }>;
}

// ── Shared UI primitives ──────────────────────────────────────────────────────

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-boca-blue-light border border-boca-border rounded-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-boca-border/60">
        <p className="type-body text-text-nav font-medium">{title}</p>
        {description && <p className="type-caption text-text-muted mt-0.5">{description}</p>}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function FieldError({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <p className="type-caption text-status-negative mt-1.5 border border-status-negative/30 rounded-sm px-3 py-1.5 bg-status-negative/5">
      {msg}
    </p>
  );
}

function SaveButton({ loading, disabled, label = 'Guardar cambios' }: { loading: boolean; disabled?: boolean; label?: string }) {
  return (
    <Button
      type="submit"
      variant="primary"
      disabled={loading || disabled}
      className="px-5 py-2"
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {label}
    </Button>
  );
}

// ── Username availability indicator ──────────────────────────────────────────

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

function useUsernameCheck(value: string, currentName: string | null) {
  const [status, setStatus] = useState<UsernameStatus>('idle');

  useEffect(() => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === (currentName ?? '')) { setStatus('idle'); return; }
    if (trimmed.length < 2) { setStatus('invalid'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) { setStatus('invalid'); return; }

    setStatus('checking');
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', trimmed)
        .maybeSingle();
      setStatus(data ? 'taken' : 'available');
    }, 500);
    return () => clearTimeout(t);
  }, [value, currentName]);

  return status;
}

function UsernameStatusBadge({ status }: { status: UsernameStatus }) {
  if (status === 'idle') return null;
  const map: Record<UsernameStatus, { icon: React.ReactNode; text: string; cls: string }> = {
    idle:      { icon: null, text: '', cls: '' },
    checking:  { icon: <Loader2 size={12} className="animate-spin" />, text: 'Verificando…', cls: 'text-text-muted' },
    available: { icon: <Check size={12} />, text: 'Disponible',   cls: 'text-status-win' },
    taken:     { icon: <X size={12} />,    text: 'Ya en uso',     cls: 'text-status-negative' },
    invalid:   { icon: <X size={12} />,    text: 'Solo letras, números y guión bajo', cls: 'text-status-negative' },
  };
  const { icon, text, cls } = map[status];
  return (
    <span className={`flex items-center gap-1 type-caption ${cls}`}>
      {icon}{text}
    </span>
  );
}

// ── Sections ──────────────────────────────────────────────────────────────────

function FotoSection({ user, onUploadAvatar }: Pick<ConfiguracionProps, 'user' | 'onUploadAvatar'>) {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const result = await onUploadAvatar(file);
    if (result.error) {
      toast.error('No se pudo subir la foto', { description: result.error });
    } else {
      toast.success('Foto de perfil actualizada');
    }
    setLoading(false);
    e.target.value = '';
  };

  return (
    <SectionCard title="Foto de perfil">
      <div className="flex items-center gap-5">
        {/* Avatar preview */}
        <div className="relative shrink-0">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover bg-boca-blue-mid" />
          ) : (
            <span className="w-16 h-16 rounded-full bg-boca-gold flex items-center justify-center text-text-on-gold font-bold text-2xl select-none">
              {(user?.displayName ?? user?.email ?? '?').charAt(0).toUpperCase()}
            </span>
          )}
          {loading && (
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <p className="type-body text-text-muted">JPG, PNG o WebP · Máx. 2MB</p>
          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            variant="outline"
            size="sm"
            className="text-text-nav border-boca-border hover:border-boca-gold hover:text-boca-gold"
          >
            <Camera size={14} />
            {user?.avatarUrl ? 'Cambiar foto' : 'Subir foto'}
          </Button>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </SectionCard>
  );
}

function UsernameSection({ user, onUpdateDisplayName }: Pick<ConfiguracionProps, 'user' | 'onUpdateDisplayName'>) {
  const [value, setValue] = useState(user?.displayName ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const status = useUsernameCheck(value, user?.displayName ?? null);
  const canSave = value.trim() !== (user?.displayName ?? '') && (status === 'available' || status === 'idle');

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
      toast.success('Nombre de usuario actualizado');
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
              onChange={e => { setValue(e.target.value); setError(null); }}
              minLength={2}
              maxLength={32}
              placeholder="Ej: xeneize1905"
              className="flex-1 bg-boca-blue border border-boca-border rounded-sm px-3 py-2 type-body text-white focus:outline-none focus:border-boca-gold transition-colors"
            />
            <UsernameStatusBadge status={status} />
          </div>
          <FieldError msg={error} />
        </div>
        <SaveButton loading={loading} disabled={!canSave} />
      </form>
    </SectionCard>
  );
}

function EmailSection({ user, onUpdateEmail }: Pick<ConfiguracionProps, 'user' | 'onUpdateEmail'>) {
  const [value, setValue] = useState('');
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
      toast.info('Confirmá tu nuevo correo', {
        description: `Te enviamos un link de verificación a ${value}`,
        duration: 7000,
      });
      setValue('');
    }
  };

  return (
    <SectionCard
      title="Correo electrónico"
      description={`Correo actual: ${user?.email}`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="type-body text-text-muted block mb-1.5">Nuevo correo</label>
          <input
            type="email"
            value={value}
            onChange={e => { setValue(e.target.value); setError(null); }}
            placeholder="nuevo@email.com"
            className="w-full bg-boca-blue border border-boca-border rounded-sm px-3 py-2 type-body text-white focus:outline-none focus:border-boca-gold transition-colors"
          />
          <FieldError msg={error} />
        </div>
        <p className="type-caption text-text-muted">Te enviaremos un link de confirmación al nuevo correo.</p>
        <SaveButton loading={loading} disabled={!value || value === user?.email} label="Cambiar correo" />
      </form>
    </SectionCard>
  );
}

function PasswordSection({ onUpdatePassword }: Pick<ConfiguracionProps, 'onUpdatePassword'>) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mismatch = confirm.length > 0 && password !== confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    if (password.length < 8) { setError('Mínimo 8 caracteres.'); return; }
    setError(null);
    setLoading(true);
    const result = await onUpdatePassword(password);
    setLoading(false);
    if (result.error) {
      setError(translateError(result.error));
    } else {
      toast.success('Contraseña actualizada');
      setPassword('');
      setConfirm('');
    }
  };

  return (
    <SectionCard title="Contraseña">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="type-body text-text-muted block mb-1.5">Nueva contraseña</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(null); }}
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              className="w-full bg-boca-blue border border-boca-border rounded-sm px-3 py-2 pr-10 type-body text-white focus:outline-none focus:border-boca-gold transition-colors"
            />
            <Button
              type="button"
              onClick={() => setShowPw(v => !v)}
              variant="ghost"
              size="icon"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-nav"
              aria-label={showPw ? 'Ocultar' : 'Mostrar'}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
          {password.length > 0 && password.length < 8 && (
            <p className="type-caption text-text-muted mt-1">{8 - password.length} caracteres más</p>
          )}
        </div>

        <div>
          <label className="type-body text-text-muted block mb-1.5">Confirmar contraseña</label>
          <input
            type={showPw ? 'text' : 'password'}
            value={confirm}
            onChange={e => { setConfirm(e.target.value); setError(null); }}
            placeholder="Repetí la contraseña"
            className={[
              'w-full bg-boca-blue border rounded-sm px-3 py-2 type-body text-white focus:outline-none transition-colors',
              mismatch ? 'border-status-negative focus:border-status-negative' : 'border-boca-border focus:border-boca-gold',
            ].join(' ')}
          />
          {mismatch && <p className="type-caption text-status-negative mt-1">Las contraseñas no coinciden</p>}
        </div>

        <FieldError msg={error} />
        <SaveButton
          loading={loading}
          disabled={!password || !confirm || mismatch || password.length < 8}
          label="Cambiar contraseña"
        />
      </form>
    </SectionCard>
  );
}

// ── Locked state ──────────────────────────────────────────────────────────────

function LockedState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 rounded-full border border-boca-border bg-boca-blue-light flex items-center justify-center mb-4">
        <svg viewBox="0 0 16 16" fill="none" className="w-7 h-7 text-text-muted">
          <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M5 7V5.5a3 3 0 0 1 6 0V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
      <p className="type-section-title text-white mb-2">Acceso restringido</p>
      <p className="type-body text-text-muted max-w-xs">Iniciá sesión para acceder a la configuración de tu cuenta.</p>
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

function BioSection({ onUpdateBio }: Pick<ConfiguracionProps, 'onUpdateBio'>) {
  const [value, setValue] = useState('');
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
      toast.success('Descripción actualizada');
    }
  };

  return (
    <SectionCard title="Descripción" description="Una línea sobre vos. Aparece en tu perfil.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <div className="relative">
            <textarea
              value={value}
              onChange={e => { setValue(e.target.value.slice(0, 160)); setError(null); }}
              rows={3}
              placeholder="Ej: Xeneize de toda la vida. Bombonera 77 veces."
              className="w-full bg-boca-blue border border-boca-border rounded-sm px-3 py-2 type-body text-white focus:outline-none focus:border-boca-gold transition-colors resize-none"
            />
            <span className={['absolute bottom-2 right-3 type-caption', remaining < 20 ? 'text-boca-gold' : 'text-text-muted/50'].join(' ')}>
              {remaining}
            </span>
          </div>
          <FieldError msg={error} />
        </div>
        <SaveButton loading={loading} />
      </form>
    </SectionCard>
  );
}

export function Configuracion({ user, onUploadAvatar, onUpdateEmail, onUpdatePassword, onUpdateDisplayName, onUpdateBio }: ConfiguracionProps) {
  if (!user) return <LockedState />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="type-section-title text-white">Configuración</h1>
        <p className="type-body text-text-muted mt-0.5">{user.displayName ?? user.email}</p>
      </div>

      <div className="flex flex-col gap-4">
        <FotoSection user={user} onUploadAvatar={onUploadAvatar} />
        <UsernameSection user={user} onUpdateDisplayName={onUpdateDisplayName} />
        <BioSection onUpdateBio={onUpdateBio} />
        <EmailSection user={user} onUpdateEmail={onUpdateEmail} />
        <PasswordSection onUpdatePassword={onUpdatePassword} />
      </div>
    </div>
  );
}

const ERROR_TRANSLATIONS: Array<[string, string]> = [
  ['same as the old email',        'El nuevo correo es igual al actual.'],
  ['already registered',           'Ese correo ya está en uso.'],
  ['Password should be at least',  'La contraseña debe tener al menos 8 caracteres.'],
  ['Auth session missing',         'Tu sesión expiró. Volvé a iniciar sesión.'],
];

function translateError(msg: string): string {
  const match = ERROR_TRANSLATIONS.find(([key]) => msg.includes(key));
  return match ? match[1] : msg;
}
