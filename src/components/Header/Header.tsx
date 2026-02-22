import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

// TODO: reemplazar con asset local (src/assets/logo-boca.svg)
// URL temporal Figma — expira en 7 días
const LOGO_SRC = 'https://www.figma.com/api/mcp/asset/ce0fb221-7700-45e3-8db4-8c7ef8b49ea1';

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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      role="banner"
      className={[
        'sticky top-0 z-sticky',
        'h-[60px] bg-boca-blue-light',
        'border-b border-boca-gold',
        'flex items-center justify-between p-[10px]',
        'transition-shadow duration-normal',
        isScrolled ? 'shadow-md' : '',
      ].join(' ')}
    >
      {/* ── Logo + Navegación ── */}
      <div className="flex items-center gap-4">
        {/* Logo Boca Juniors 40×39px — sin animación hover */}
        <a href="/" aria-label="La 12 Digital - Inicio" className="shrink-0">
          <img
            src={LOGO_SRC}
            alt="Escudo Boca Juniors"
            width={40}
            height={39}
            className="object-contain"
          />
        </a>

        {/* Navegación principal */}
        <nav aria-label="Navegación principal">
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

      {/* ── 3 Estrellas = Copas Libertadores ── */}
      <div
        className="flex items-center gap-2 text-boca-gold shrink-0"
        aria-label="3 Copas Libertadores"
      >
        <Star size={16} fill="currentColor" aria-hidden="true" />
        <Star size={16} fill="currentColor" aria-hidden="true" />
        <Star size={16} fill="currentColor" aria-hidden="true" />
      </div>
    </header>
  );
}
