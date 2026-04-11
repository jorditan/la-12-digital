import { useState } from 'react';
import { Button } from '../ui/Button';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
  error: string | null;
}

export function LoginForm({ onLogin, onRegister, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === 'login') {
      await onLogin(email, password);
    } else {
      await onRegister(email, password);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-boca-blue-light border border-boca-border rounded-xl p-8">
        <div className="text-center mb-6">
          <p className="type-section-title text-boca-gold">La 12 Digital</p>
          <p className="type-caption text-text-muted mt-1">
            {mode === 'login' ? 'Iniciá sesión para ver tu historial' : 'Creá tu cuenta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="type-caption text-text-nav block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-boca-blue border border-boca-border rounded-lg px-3 py-2 text-white type-body focus:outline-none focus:border-boca-gold"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="type-caption text-text-nav block mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-boca-blue border border-boca-border rounded-lg px-3 py-2 text-white type-body focus:outline-none focus:border-boca-gold"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {error && (
            <p className="type-caption text-status-negative text-center">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            className="w-full py-2.5 rounded-lg"
          >
            {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </Button>
        </form>

        <Button
          onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}
          variant="text"
          className="w-full mt-4 type-caption text-text-muted hover:text-text-nav text-center"
        >
          {mode === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Iniciá sesión'}
        </Button>
      </div>
    </div>
  );
}
