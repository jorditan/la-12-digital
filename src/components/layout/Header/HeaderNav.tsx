import { Link, NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './constants';

export function HeaderNav() {
  return (
    <div className="flex items-center gap-4">
      <Link to="/" aria-label="La 12 Digital - Inicio" className="shrink-0">
        <img
          src={'/logo_aplicacion.png'}
          alt="Escudo Boca Juniors"
          width={24}
          height={24}
          className="object-contain"
        />
      </Link>

      <nav aria-label="Navegación principal" className="hidden sm:block">
        <ul className="flex items-center gap-4" role="list">
          {NAV_ITEMS.map(({ label, href, end }) => (
            <li key={href}>
              <NavLink
                to={href}
                end={end}
                className={({ isActive }) =>
                  [
                    'flex items-center min-h-[40px] rounded-sm font-serif text-sm font-medium leading-5',
                    'transition-all duration-normal focus:outline-none focus-visible:ring-2 focus-visible:ring-boca-gold',
                    isActive
                      ? 'text-boca-gold underline decoration-boca-gold/60 underline-offset-[6px] decoration-2'
                      : 'text-text-nav hover:text-boca-gold hover:underline hover:decoration-boca-gold/30 hover:underline-offset-[6px] hover:decoration-2',
                  ].join(' ')
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
