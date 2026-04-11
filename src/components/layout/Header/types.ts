import type { AuthUser } from '@/types/attendance';

export interface HeaderProps {
  user: AuthUser | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onUploadAvatar: (file: File) => Promise<{ error?: string }>;
}

