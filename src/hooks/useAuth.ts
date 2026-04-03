import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { AuthUser, AsyncState } from '@/types/attendance';

export interface UseAuthReturn {
  user: AuthUser | null;
  estado: AsyncState;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [estado, setEstado] = useState<AsyncState>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? '' });
      }
      setEstado('ok');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? '' });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) setError(authError.message);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    setError(null);
    const { error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) setError(authError.message);
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return { user, estado, error, login, register, logout };
}
