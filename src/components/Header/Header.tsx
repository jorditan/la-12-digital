import { useState, useEffect } from 'react';
import { Star, Menu, X } from 'lucide-react';

const LOGO_SRC = '/escudo_boca.png';

type NavId = 'inicio' | 'plantel' | 'asistencia';

interface HeaderProps {
  activePage?: NavId;
}

const NAV_ITEMS: { id: NavId; label: string; href: string }[] = [
  { id: 'inicio',     label: 'Inicio',               href: '/' },
  { id: 'plantel',    label: 'Plantel',              href: '/plantel' },
  { id: 'asistencia', label: 'Asistencia a partidos', href: '/asistencia' },
];

export function Header({ activePage = 'inicio' }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cierra el menú al redimensionar a desktop
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 640) setIsMenuOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={['sticky top-0 z-sticky', 'transition-shadow duration-normal', isScrolled && !isMenuOpen ? 'shadow-md' : ''].join(' ')}>
      <header
        role="banner"
        className="h-[60px] bg-boca-blue-light border-b border-boca-gold flex items-center justify-between px-4 sm:px-[10px]"
      >
        {/* ── Logo + Navegación desktop ── */}
        <div className="flex items-center gap-4">
          <a href="/" aria-label="La 12 Digital - Inicio" className="shrink-0">
            <img
              src={LOGO_SRC}
              alt="Escudo Boca Juniors"
              width={40}
              height={39}
              className="object-contain"
            />
          </a>

          {/* Nav: visible solo en sm+ */}
          <nav aria-label="Navegación principal" className="hidden sm:block">
            <ul className="flex items-center gap-4" role="list">
              {NAV_ITEMS.map(({ id, label, href }) => {
                const isActive = activePage === id;
                return (
                  <li key={id}>
                    <a
                      href={href}
                      aria-current={isActive ? 'page' : undefined}
                      className={[
                        'flex items-center min-h-[40px]',
                        'rounded-sm',
                        'font-serif text-sm font-medium leading-5',
                        'transition-colors duration-normal',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-boca-gold',
                        isActive
                          ? 'text-boca-gold'
                          : 'text-[#e0e7ff] hover:text-boca-gold',
                      ].join(' ')}
                    >
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* ── Derecha: estrellas + hamburger ── */}
        <div className="flex items-center gap-3">
          {/* 3 Estrellas = Copas Libertadores */}
          <div
            className="flex items-center gap-2 text-boca-gold shrink-0"
            aria-label="3 Copas Libertadores"
          >
            <Star size={16} fill="currentColor" aria-hidden="true" />
            <Star size={16} fill="currentColor" aria-hidden="true" />
            <Star size={16} fill="currentColor" aria-hidden="true" />
          </div>

          {/* Hamburger: solo en mobile */}
          <button
            className="sm:hidden p-1 text-boca-gold"
            onClick={() => setIsMenuOpen(o => !o)}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ── Menú móvil desplegable ── */}
      {isMenuOpen && (
        <nav
          aria-label="Navegación móvil"
          className="sm:hidden bg-boca-blue-light border-b border-boca-gold"
        >
          <ul className="flex flex-col px-4 py-2" role="list">
            {NAV_ITEMS.map(({ id, label, href }) => {
              const isActive = activePage === id;
              return (
                <li key={id}>
                  <a
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setIsMenuOpen(false)}
                    className={[
                      'flex items-center py-3',
                      'border-b border-boca-gold/10 last:border-0',
                      'font-serif text-sm font-medium leading-5',
                      'transition-colors duration-normal',
                      isActive
                        ? 'text-boca-gold'
                        : 'text-[#e0e7ff] hover:text-boca-gold',
                    ].join(' ')}
                  >
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
