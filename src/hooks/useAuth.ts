import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { AuthUser, AsyncState } from '@/types/attendance';

function userFromSession(sessionUser: { id: string; email?: string; user_metadata?: Record<string, string> }): AuthUser {
  const meta = sessionUser.user_metadata ?? {};
  return {
    id: sessionUser.id,
    email: sessionUser.email ?? '',
    displayName: meta.display_name ?? null,
    avatarUrl: meta.avatar_url ?? null,
  };
}

type AuthResult = { error?: string };

export interface UseAuthReturn {
  user: AuthUser | null;
  estado: AsyncState;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string, displayName: string) => Promise<AuthResult & { needsConfirmation?: boolean }>;
  logout: () => Promise<void>;
  uploadAvatar: (file: File) => Promise<AuthResult>;
  updateEmail: (email: string) => Promise<AuthResult & { needsConfirmation?: boolean }>;
  updatePassword: (password: string) => Promise<AuthResult>;
  updateDisplayName: (name: string) => Promise<AuthResult>;
  updateBio: (bio: string) => Promise<AuthResult>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [estado, setEstado] = useState<AsyncState>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(userFromSession(session.user));
      setEstado('ok');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? userFromSession(session.user) : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError(authError.message); return { error: authError.message }; }
    return {};
  }, []);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    setError(null);
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (authError) { setError(authError.message); return { error: authError.message }; }
    return { needsConfirmation: !data.session };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!user) return { error: 'No autenticado' };

    // Validate MIME type against a strict whitelist to prevent SVG/HTML stored XSS.
    const ALLOWED_MIME_TYPES: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png':  'png',
      'image/webp': 'webp',
      'image/gif':  'gif',
    };
    const mimeType = file.type.toLowerCase();
    const safeExt = ALLOWED_MIME_TYPES[mimeType];
    if (!safeExt) {
      return { error: 'Formato no permitido. Solo se aceptan JPG, PNG, WebP y GIF.' };
    }

    // Use the MIME-derived extension (not the filename) to prevent extension spoofing.
    const path = `${user.id}/avatar.${safeExt}`;

    const { data: storageData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: mimeType });

    if (uploadError || !storageData) return { error: uploadError?.message ?? 'Error al subir la imagen' };

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(storageData.path);
    const { data: updated, error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: urlData.publicUrl },
    });
    if (updateError) return { error: updateError.message };
    if (updated.user) setUser(userFromSession(updated.user));
    return {};
  }, [user]);

  const updateEmail = useCallback(async (email: string) => {
    const { error: authError } = await supabase.auth.updateUser({ email });
    if (authError) return { error: authError.message };
    return { needsConfirmation: true };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error: authError } = await supabase.auth.updateUser({ password });
    if (authError) return { error: authError.message };
    return {};
  }, []);

  const updateDisplayName = useCallback(async (name: string) => {
    if (!user) return { error: 'No autenticado' };

    // Upsert to profiles table (enforces uniqueness constraint)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, username: name }, { onConflict: 'id' });

    if (profileError) {
      if (profileError.code === '23505') return { error: 'Ese nombre de usuario ya está en uso.' };
      return { error: profileError.message };
    }

    // Sync to user_metadata for fast reads
    const { data: updated, error: authError } = await supabase.auth.updateUser({
      data: { display_name: name },
    });
    if (authError) return { error: authError.message };
    if (updated.user) setUser(userFromSession(updated.user));
    return {};
  }, [user]);

  const updateBio = useCallback(async (bio: string) => {
    if (!user) return { error: 'No autenticado' };
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, bio: bio.trim() || null }, { onConflict: 'id' });
    if (profileError) return { error: profileError.message };
    return {};
  }, [user]);

  return { user, estado, error, login, register, logout, uploadAvatar, updateEmail, updatePassword, updateDisplayName, updateBio };
}
