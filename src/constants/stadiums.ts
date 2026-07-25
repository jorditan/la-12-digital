/**
 * Diccionario de estadios habituales para equipos rivales (uso cuando Boca es visitante)
 */
export const RIVAL_STADIUMS: Record<string, string> = {
  'river plate': 'Estadio Mâs Monumental',
  'river': 'Estadio Mâs Monumental',
  'racing': 'Estadio Presidente Perón',
  'independiente': 'Estadio Libertadores de América - Ricardo Enrique Bochini',
  'san lorenzo': 'Estadio Pedro Bidegain',
  'vélez': 'Estadio José Amalfitani',
  'velez': 'Estadio José Amalfitani',
  'estudiantes': 'Estadio Jorge Luis Hirschi',
  'gimnasia lp': 'Estadio Juan Carmelo Zerillo',
  'gimnasia (lp)': 'Estadio Juan Carmelo Zerillo',
  'rosario central': 'Estadio Gigante de Arroyito',
  "newell's": 'Estadio Marcelo Alberto Bielsa',
  'newells': 'Estadio Marcelo Alberto Bielsa',
  'talleres': 'Estadio Mario Alberto Kempes',
  'belgrano': 'Estadio Julio César Villagra',
  'lanús': 'Estadio Ciudad de Lanús - Néstor Díaz Pérez',
  'lanus': 'Estadio Ciudad de Lanús - Néstor Díaz Pérez',
  'banfield': 'Estadio Florencio Sola',
  'defensa y justicia': 'Estadio Norberto Tito Tomaghello',
  'defensa': 'Estadio Norberto Tito Tomaghello',
  'deportivo riestra': 'Estadio Guillermo Laza',
  'riestra': 'Estadio Guillermo Laza',
  'platense': 'Estadio Ciudad de Vicente López',
  'tigre': 'Estadio José Dellagiovanna',
  'argentinos': 'Estadio Diego Armando Maradona',
  'huracán': 'Estadio Tomás Adolfo Ducó',
  'huracan': 'Estadio Tomás Adolfo Ducó',
  'unión': 'Estadio 15 de Abril',
  'union': 'Estadio 15 de Abril',
  'central córdoba': 'Estadio Alfredo Terrera',
  'central cordoba': 'Estadio Alfredo Terrera',
  'atlético tucumán': 'Estadio Monumental José Fierro',
  'atletico tucuman': 'Estadio Monumental José Fierro',
  'barracas central': 'Estadio Claudio "Chiqui" Tapia',
  'barracas': 'Estadio Claudio "Chiqui" Tapia',
  'independiente rivadavia': 'Estadio Bautista Gargantini',
  'instituto': 'Estadio Juan Domingo Perón',
  'gimnasia de mendoza': 'Estadio Víctor Antonio Legrotaglie',
  'o\'higgins': 'Estadio El Teniente',
  'ohiggins': 'Estadio El Teniente',
};

export function resolveVenueName(
  isBocaHome: boolean,
  venueName?: string | null,
  rivalName?: string
): string {
  // Regla 1: Si Boca es Local, es siempre La Bombonera
  if (isBocaHome) {
    return 'Estadio Alberto José Armando';
  }

  // Regla 2: Si viene especificado un estadio válido de visitante, usarlo
  if (venueName && venueName.trim().length > 0 && venueName !== 'Estadio a confirmar') {
    return venueName.trim();
  }

  // Regla 3: Si no hay estadio asignado, buscar en el diccionario del rival
  if (rivalName) {
    const rivalLower = rivalName.toLowerCase();
    for (const [teamKey, stadiumName] of Object.entries(RIVAL_STADIUMS)) {
      if (rivalLower.includes(teamKey)) {
        return stadiumName;
      }
    }
  }

  return 'Estadio a confirmar';
}
