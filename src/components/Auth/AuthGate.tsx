import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from './LoginForm';
import type { AuthUser } from '@/types/attendance';

interface AuthGateProps {
  children: (args: { user: AuthUser; logout: () => Promise<void> }) => React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { user, estado, error, login, register, logout } = useAuth();

  if (estado === 'loading') {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <p className="type-body text-text-muted">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={login} onRegister={register} error={error} />;
  }

  return <>{children({ user, logout })}</>;
}
