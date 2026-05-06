import { NavLink } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { Button } from "../../ui/Button";
import { NAV_ITEMS } from "./constants";
import { UserAvatar } from "./UserAvatar";
import type { HeaderProps } from "./types";

type HeaderMobileMenuProps = Pick<
  HeaderProps,
  "user" | "onLoginClick" | "onLogout"
> & {
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function HeaderMobileMenu({
  user,
  onLoginClick,
  onLogout,
  setIsMenuOpen,
}: HeaderMobileMenuProps) {
  return (
    <nav
      aria-label="Navegación móvil"
      className="sm:hidden bg-boca-blue-light border-b border-boca-gold animate-fade-in"
    >
      <ul className="flex flex-col px-4 py-2" role="list">
        {NAV_ITEMS.map(({ label, href, end }) => (
          <li key={href}>
            <NavLink
              to={href}
              end={end}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                [
                  "flex items-center py-3 border-b border-boca-gold/10 last:border-0",
                  "font-serif text-sm font-medium leading-5 transition-colors duration-normal",
                  isActive
                    ? "text-boca-gold"
                    : "text-text-nav hover:text-boca-gold",
                ].join(" ")
              }
            >
              {label}
            </NavLink>
          </li>
        ))}

        <li className="py-3 border-t border-boca-gold/10 mt-1">
          <a
            href="https://cafecito.app/la-12-digital"
            rel="noopener"
            target="_blank"
            aria-label="Invitame un café en cafecito.app"
          >
            <img
              srcSet="https://cdn.cafecito.app/imgs/buttons/button_5.png 1x, https://cdn.cafecito.app/imgs/buttons/button_5_2x.png 2x, https://cdn.cafecito.app/imgs/buttons/button_5_3.75x.png 3.75x"
              src="https://cdn.cafecito.app/imgs/buttons/button_5.png"
              alt="Invitame un café en cafecito.app"
              className="h-9 w-auto"
            />
          </a>
        </li>

        <li className="pt-2 pb-1 border-t border-boca-gold/10 mt-1">
          {!user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsMenuOpen(false);
                onLoginClick();
              }}
              className="gap-2 justify-start"
            >
              <User size={14} aria-hidden="true" />
              Iniciar sesión
            </Button>
          ) : (
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <UserAvatar user={user} size={28} />
                <span className="type-body text-text-nav truncate max-w-[160px]">
                  {user.displayName ?? user.email}
                </span>
              </div>
              <Button
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout();
                }}
                variant="text"
                size="xs"
                className="type-caption text-text-muted hover:text-status-negative flex items-center gap-1"
              >
                <LogOut size={13} />
                Salir
              </Button>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}
