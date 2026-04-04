import { Link } from 'react-router-dom';
import { LogOut, Star, User } from 'lucide-react';
import { Button } from '../Button';
import { UserAvatar } from './UserAvatar';
import type { HeaderProps } from './types';

type HeaderUserSectionProps = Pick<HeaderProps, 'user' | 'onLoginClick' | 'onLogout'> & {
  isUserMenuOpen: boolean;
  setIsUserMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userMenuRef: React.RefObject<HTMLDivElement>;
};

export function HeaderUserSection({
  user,
  onLoginClick,
  onLogout,
  isUserMenuOpen,
  setIsUserMenuOpen,
  userMenuRef,
}: HeaderUserSectionProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 text-boca-gold shrink-0" aria-label="3 Copas Libertadores" title="3 Copas Libertadores">
        <Star size={14} fill="currentColor" aria-hidden="true" />
        <Star size={14} fill="currentColor" aria-hidden="true" />
        <Star size={14} fill="currentColor" aria-hidden="true" />
      </div>

      {!user ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={onLoginClick}
          className="hidden sm:inline-flex gap-1.5"
        >
          <User size={13} aria-hidden="true" />
          Iniciar sesión
        </Button>
      ) : (
        <div ref={userMenuRef} className="hidden sm:block relative">
          <Button
            onClick={() => setIsUserMenuOpen((open) => !open)}
            variant="ghost"
            className="px-2 py-1 hover:bg-boca-blue-mid"
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
          >
            <UserAvatar user={user} size={28} />
            <span className="type-caption text-text-nav max-w-[120px] truncate hidden md:block">
              {user.displayName ?? user.email}
            </span>
          </Button>

          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-boca-blue-light border border-boca-border rounded-sm shadow-2xl z-[100] overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-boca-border">
                {user.displayName && (
                  <p className="type-body text-text-nav font-medium truncate">{user.displayName}</p>
                )}
                <p className="type-caption text-text-muted truncate">{user.email}</p>
              </div>
              <Link
                to="/configuracion"
                onClick={() => setIsUserMenuOpen(false)}
                className="w-full flex items-center gap-2 px-4 py-3 type-body text-text-nav hover:bg-boca-blue-mid transition-colors border-b border-boca-border/40"
              >
                <User size={14} aria-hidden="true" />
                Ir a mi perfil
              </Link>
              <div
                onClick={() => {
                  setIsUserMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex gap-2 items-center transition-all duration-75 cursor-pointer justify-start px-4 py-3 type-body text-text-nav hover:text-status-negative hover:bg-boca-blue-mid"
              >
                <LogOut size={14} aria-hidden="true" />
                Cerrar sesión
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

