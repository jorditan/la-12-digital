import { Menu, X } from "lucide-react";
import { Button } from "../../ui/Button";
import { HeaderMobileMenu } from "./HeaderMobileMenu";
import { HeaderNav } from "./HeaderNav";
import { HeaderUserSection } from "./HeaderUserSection";
import type { HeaderProps } from "./types";
import { useHeaderState } from "./useHeaderState";

export function Header({
  user,
  onLoginClick,
  onLogout,
  onUploadAvatar,
}: HeaderProps) {
  const {
    isScrolled,
    isMenuOpen,
    setIsMenuOpen,
    isUserMenuOpen,
    setIsUserMenuOpen,
    userMenuRef,
    avatarInputRef,
    handleAvatarChange,
  } = useHeaderState(onUploadAvatar);

  return (
    <div
      className={[
        "sticky top-0 z-sticky",
        "transition-shadow duration-normal",
        isScrolled && !isMenuOpen ? "shadow-md" : "",
      ].join(" ")}
    >
      <header
        role="banner"
        className="h-[60px] bg-boca-blue-light flex items-center justify-between px-4 sm:px-[10px]"
      >
        {/* ── Logo + Navegación desktop ── */}
        <HeaderNav />

        <HeaderUserSection
          user={user}
          onLoginClick={onLoginClick}
          onLogout={onLogout}
          isUserMenuOpen={isUserMenuOpen}
          setIsUserMenuOpen={setIsUserMenuOpen}
          userMenuRef={userMenuRef}
        />

        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />

        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden text-boca-gold"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </Button>
      </header>

      {isMenuOpen && (
        <HeaderMobileMenu
          user={user}
          onLoginClick={onLoginClick}
          onLogout={onLogout}
          setIsMenuOpen={setIsMenuOpen}
        />
      )}
    </div>
  );
}
