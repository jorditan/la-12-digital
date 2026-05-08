import type { AuthUser } from "@/types/attendance";
import { sanitizeImageSrc } from "@/utils/urlSafety";

function getInitials(user: AuthUser): string {
  if (user.displayName) {
    return user.displayName.charAt(0).toUpperCase();
  }
  return user.email.charAt(0).toUpperCase();
}

export function UserAvatar({
  user,
  size = 28,
}: {
  user: AuthUser;
  size?: number;
}) {
  const safeAvatar = sanitizeImageSrc(user.avatarUrl);

  if (safeAvatar) {
    return (
      <img
        src={safeAvatar}
        alt={user.displayName ?? user.email}
        width={size}
        height={size}
        className="rounded-full object-cover bg-boca-blue-mid shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className="rounded-full bg-boca-gold flex items-center justify-center text-text-on-gold font-bold select-none shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {getInitials(user)}
    </span>
  );
}
