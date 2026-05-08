import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../ui/Button";
import { SectionCard } from "../../ui/SectionCard";
import type { AuthUser } from "@/types/attendance";
import { sanitizeImageSrc } from "@/utils/urlSafety";

interface AvatarSectionProps {
  user: AuthUser | null;
  onUploadAvatar: (file: File) => Promise<{ error?: string }>;
}

export function AvatarSection({ user, onUploadAvatar }: AvatarSectionProps) {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const safeAvatar = sanitizeImageSrc(user?.avatarUrl);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const result = await onUploadAvatar(file);
    if (result.error) {
      toast.error("No se pudo subir la foto", { description: result.error });
    } else {
      toast.success("Foto de perfil actualizada");
    }
    setLoading(false);
    e.target.value = "";
  };

  return (
    <SectionCard title="Foto de perfil">
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          {safeAvatar ? (
            <img
              src={safeAvatar}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover bg-boca-blue-mid"
            />
          ) : (
            <span className="w-16 h-16 rounded-full bg-boca-gold flex items-center justify-center text-text-on-gold font-bold text-2xl select-none">
              {(user?.displayName ?? user?.email ?? "?")
                .charAt(0)
                .toUpperCase()}
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
            {user?.avatarUrl ? "Cambiar foto" : "Subir foto"}
          </Button>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </SectionCard>
  );
}
