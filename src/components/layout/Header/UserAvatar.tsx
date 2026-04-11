import type { AuthUser } from '@/types/attendance';

function getInitials(user: AuthUser): string {
  if (user.displayName) {
    return user.displayName.charAt(0).toUpperCase();
  }
  return user.email.charAt(0).toUpperCase();
}

export function UserAvatar({ user, size = 28 }: { user: AuthUser; size?: number }) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
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

