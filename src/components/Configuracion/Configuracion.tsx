import type { AuthUser } from "@/types/attendance";
import { AvatarSection } from "./sections/AvatarSection";
import { UsernameSection } from "./sections/UsernameSection";
import { EmailSection } from "./sections/EmailSection";
import { PasswordSection } from "./sections/PasswordSection";
import { BioSection } from "./sections/BioSection";

interface ConfiguracionProps {
  user: AuthUser | null;
  onUploadAvatar: (file: File) => Promise<{ error?: string }>;
  onUpdateEmail: (
    email: string,
  ) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  onUpdatePassword: (password: string) => Promise<{ error?: string }>;
  onUpdateDisplayName: (name: string) => Promise<{ error?: string }>;
  onUpdateBio: (bio: string) => Promise<{ error?: string }>;
}

function LockedState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 rounded-full border border-boca-border bg-boca-blue-light flex items-center justify-center mb-4">
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className="w-7 h-7 text-text-muted"
        >
          <rect
            x="3"
            y="7"
            width="10"
            height="8"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M5 7V5.5a3 3 0 0 1 6 0V7"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="type-section-title text-white mb-2">Acceso restringido</p>
      <p className="type-body text-text-muted max-w-xs">
        Iniciá sesión para acceder a la configuración de tu cuenta.
      </p>
    </div>
  );
}

export function Configuracion({
  user,
  onUploadAvatar,
  onUpdateEmail,
  onUpdatePassword,
  onUpdateDisplayName,
  onUpdateBio,
}: ConfiguracionProps) {
  if (!user) return <LockedState />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="type-section-title text-white">Configuración</h1>
        <p className="type-body text-text-muted mt-0.5">
          {user.displayName ?? user.email}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <AvatarSection user={user} onUploadAvatar={onUploadAvatar} />
        <UsernameSection user={user} onUpdateDisplayName={onUpdateDisplayName} />
        <BioSection onUpdateBio={onUpdateBio} />
        <EmailSection user={user} onUpdateEmail={onUpdateEmail} />
        <PasswordSection onUpdatePassword={onUpdatePassword} />
      </div>
    </div>
  );
}
