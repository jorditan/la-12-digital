/**
 * Equipos de la Primera División Argentina (Liga Profesional).
 * Logos provienen de TheSportsDB CDN (acceso público, sin autenticación).
 */

export interface Equipo {
  id: number;        // ID de API-Football (usado en fixtures)
  nombre: string;
  apodo: string;
  escudo_url: string;
}

export const EQUIPOS: Equipo[] = [
  // ── IDs confirmados (usados en el proyecto) ──────────────────────────────
  { id: 451, nombre: 'Boca Juniors',          apodo: 'Xeneizes',           escudo_url: 'https://www.thesportsdb.com/images/media/team/badge/2en2k01769678216.png' },
  { id: 452, nombre: 'River Plate',           apodo: 'Millonarios',        escudo_url: 'https://r2.thesportsdb.com/images/media/team/badge/03dmi31645539717.png' },
  { id: 435, nombre: 'Racing Club',           apodo: 'La Academia',        escudo_url: 'https://r2.thesportsdb.com/images/media/team/badge/vi4mu41695734959.png' },
  { id: 436, nombre: 'Estudiantes',           apodo: 'El Pincha',          escudo_url: 'https://r2.thesportsdb.com/images/media/team/badge/pf08dq1760634366.png' },
  { id: 447, nombre: 'Argentinos Juniors',    apodo: 'El Bicho',           escudo_url: 'https://www.thesportsdb.com/images/media/team/badge/uqfjuo1769234850.png' },
  { id: 449, nombre: 'Talleres',              apodo: 'La T',               escudo_url: 'https://www.thesportsdb.com/images/media/team/badge/7hum2t1769310938.png' },
  { id: 442, nombre: 'San Lorenzo',           apodo: 'El Ciclón',          escudo_url: 'https://r2.thesportsdb.com/images/media/team/badge/qr7ose1517769136.png' },
  { id: 455, nombre: 'Independiente',         apodo: 'El Rojo',            escudo_url: 'https://r2.thesportsdb.com/images/media/team/badge/eki4nd1580842605.png' },
  { id: 440, nombre: 'Vélez Sársfield',       apodo: 'El Fortín',          escudo_url: 'https://r2.thesportsdb.com/images/media/team/badge/jo98m71517769587.png' },
  { id: 441, nombre: 'Huracán',               apodo: 'El Globo',           escudo_url: 'https://r2.thesportsdb.com/images/media/team/badge/3cafun1580842587.png' },
  { id: 453, nombre: 'Lanús',                 apodo: 'El Granate',         escudo_url: 'https://www.thesportsdb.com/images/media/team/badge/ddty0w1769146364.png' },
  { id: 444, nombre: 'Banfield',              apodo: 'El Taladro',         escudo_url: 'https://r2.thesportsdb.com/images/media/team/badge/udyvv91517768017.png' },
  { id: 454, nombre: "Newell's Old Boys",     apodo: 'La Lepra',           escudo_url: 'https://r2.thesportsdb.com/images/media/team/badge/23aftf1580842633.png' },
  { id: 486, nombre: 'Tigre',                 apodo: 'El Matador',         escudo_url: 'https://r2.thesportsdb.com/images/media/team/badge/krryg71765858882.png' },
  { id: 481, nombre: 'Belgrano',              apodo: 'El Pirata',          escudo_url: 'https://r2.thesportsdb.com/images/media/team/badge/0twgzi1517768087.png' },
  { id: 437, nombre: 'Rosario Central',       apodo: 'El Canalla',         escudo_url: 'https://www.thesportsdb.com/images/media/team/badge/y6q1ds1769660256.png' },

  // ── Resto de Primera División ─────────────────────────────────────────────
  { id: 463, nombre: 'Platense',              apodo: 'El Calamar',         escudo_url: 'https://www.thesportsdb.com/images/media/team/badge/lbs14n1769317149.png' },
  { id: 470, nombre: 'Defensa y Justicia',    apodo: 'El Halcón',          escudo_url: 'https://r2.thesportsdb.com/images/media/team/badge/e5dof21626200467.png' },
  { id: 450, nombre: 'Gimnasia LP',           apodo: 'El Lobo',            escudo_url: 'https://r2.thesportsdb.com/images/media/team/badge/ikefvs1517768540.png' },
  { id: 459, nombre: 'Godoy Cruz',            apodo: 'El Tomba',           escudo_url: 'https://r2.thesportsdb.com/images/media/team/badge/d3c0ds1517768584.png' },
  { id: 480, nombre: 'San Martín (T)',        apodo: 'Santo',              escudo_url: 'https://r2.thesportsdb.com/images/media/team/badge/vuqpry1517769251.png' },
  { id: 488, nombre: 'Instituto',             apodo: 'La Gloria',          escudo_url: 'https://r2.thesportsdb.com/images/media/team/badge/jup59w1578825794.png' },
  { id: 473, nombre: 'Central Córdoba',       apodo: 'El Ferroviario',     escudo_url: 'https://r2.thesportsdb.com/images/media/team/badge/d62xkc1576101576.png' },
  { id: 491, nombre: 'Sarmiento',             apodo: 'El Verde',           escudo_url: 'https://r2.thesportsdb.com/images/media/team/badge/xxofu71677634191.png' },
  { id: 497, nombre: 'Barracas Central',      apodo: "La Acadé",           escudo_url: 'https://r2.thesportsdb.com/images/media/team/badge/rbkjba1707458543.png' },
  { id: 495, nombre: 'Riestra',               apodo: 'El Matador Villero', escudo_url: 'https://r2.thesportsdb.com/images/media/team/badge/nq0qqh1686247632.png' },
];

/** Devuelve la URL del escudo por ID de equipo. */
export function getEscudo(id: number): string {
  return EQUIPOS.find(e => e.id === id)?.escudo_url ?? '';
}
