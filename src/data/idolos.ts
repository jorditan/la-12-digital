/**
 * Ídolos históricos del Club Atlético Boca Juniors.
 * Datos reales verificados — usados en el juego "¿Qué ídolo es?".
 */

export interface Idolo {
  id: string;
  nombre: string;
  apellido: string;
  apodo: string;
  posicion: string;
  dorsal: string;
  periodos: string[];
  titulos: string[];
  descripcion: string;
  /** URL pública del recorte del jugador. null → placeholder estilizado. */
  imageUrl: string | null;
  /** 3 pistas ordenadas de más vaga a más obvia. */
  pistas: [string, string, string];
}

export const IDOLOS: Idolo[] = [
  {
    id: 'maradona',
    nombre: 'Diego Armando',
    apellido: 'Maradona',
    apodo: 'El Pibe de Oro',
    posicion: 'Mediapunta',
    dorsal: '10',
    periodos: ['1981–1982', '1995–1997'],
    titulos: ['Metropolitano 1981', 'Nacional 1981'],
    descripcion:
      'Considerado el mejor jugador de la historia. En su primera etapa en Boca ganó el Metropolitano y el Nacional 1981. Regresó en 1995 junto a Caniggia. Fue declarado Patrimonio Cultural de la Nación.',
    imageUrl: 'https://r2.thesportsdb.com/images/media/player/cutout/v298851606327825.png',
    pistas: [
      'Vistió la camiseta número 10 xeneize en dos etapas distintas',
      'Ganó el Metropolitano y el Nacional en su primera temporada en el club',
      'Es considerado el mejor futbolista de todos los tiempos',
    ],
  },
  {
    id: 'riquelme',
    nombre: 'Juan Román',
    apellido: 'Riquelme',
    apodo: 'Román',
    posicion: 'Mediocampista ofensivo',
    dorsal: '10',
    periodos: ['1996–2007', '2012–2014'],
    titulos: [
      'Copa Libertadores 2000, 2001, 2007',
      'Copa Intercontinental 2000',
      'Copa Sudamericana 2004, 2005',
      'Recopa Sudamericana 2005, 2006',
    ],
    descripcion:
      'El ídolo máximo de la historia de Boca Juniors. Zurdo de juego elegante y lento, ganó tres Copa Libertadores. Finalista del Mundial de Clubes 2000. Actualmente presidente del club.',
    imageUrl: null,
    pistas: [
      'Zurdo de juego pausado, ganó tres Copa Libertadores con el club',
      'Es el ídolo más amado en toda la historia xeneize',
      'Hoy ocupa la presidencia del Club Atlético Boca Juniors',
    ],
  },
  {
    id: 'palermo',
    nombre: 'Martín',
    apellido: 'Palermo',
    apodo: 'El Titán',
    posicion: 'Delantero centro',
    dorsal: '9',
    periodos: ['1997–2000', '2004–2011'],
    titulos: [
      'Copa Libertadores 1999, 2000, 2001, 2007',
      'Copa Intercontinental 2000',
      'Copa Sudamericana 2004, 2005',
    ],
    descripcion:
      'Máximo goleador histórico de Boca Juniors con 236 goles. Conocido por su determinación y por marcar en momentos decisivos. Protagonizó la remontada épica en el Clausura 2011.',
    imageUrl: null,
    pistas: [
      'Vistió la camiseta número 9 y jugó en dos etapas en el club',
      'Es el máximo goleador en toda la historia del club',
      'Su apodo es "El Titán" y lleva 236 goles oficiales',
    ],
  },
  {
    id: 'tevez',
    nombre: 'Carlos',
    apellido: 'Tevez',
    apodo: 'El Apache',
    posicion: 'Delantero',
    dorsal: '32',
    periodos: ['2001–2004', '2015–2019'],
    titulos: [
      'Copa Libertadores 2003',
      'Copa Sudamericana 2005',
      'Liga Profesional 2015, 2017, 2018',
    ],
    descripcion:
      'Surgido de las inferiores xeneizes, ganó la Libertadores 2003 con solo 19 años. Regresó a su club de origen para cerrar su carrera con más títulos. Oriundo del barrio de Fuerte Apache.',
    imageUrl: 'https://r2.thesportsdb.com/images/media/player/cutout/na8lpp1654245743.png',
    pistas: [
      'Surgió de las inferiores y debutó en La Bombonera siendo muy joven',
      'Ganó la Copa Libertadores con solo 19 años',
      'Su apodo es "El Apache" y viene del barrio porteño de Fuerte Apache',
    ],
  },
  {
    id: 'abbondanzieri',
    nombre: 'Roberto',
    apellido: 'Abbondanzieri',
    apodo: 'El Pato',
    posicion: 'Arquero',
    dorsal: '1',
    periodos: ['1997–2006'],
    titulos: [
      'Copa Libertadores 2000, 2001, 2003',
      'Copa Intercontinental 2000',
      'Copa Sudamericana 2004, 2005',
    ],
    descripcion:
      'Uno de los mejores arqueros de la historia de Boca. Pieza fundamental del ciclo más ganador del club. Fue arquero titular de la Selección Argentina en el Mundial Alemania 2006.',
    imageUrl: 'https://r2.thesportsdb.com/images/media/player/cutout/52ky7p1676572731.png',
    pistas: [
      'Arquero fundamental en el ciclo dorado de principios de los 2000',
      'Su apodo es el nombre de un animal acuático',
      'Fue el arquero titular de Argentina en el Mundial Alemania 2006',
    ],
  },
  {
    id: 'battaglia',
    nombre: 'Sebastián',
    apellido: 'Battaglia',
    apodo: 'El Cacique',
    posicion: 'Mediocampista central',
    dorsal: '5',
    periodos: ['1999–2006', '2008–2012'],
    titulos: [
      'Copa Libertadores 2000, 2001, 2003, 2007',
      'Copa Intercontinental 2000',
      'Copa Sudamericana 2004, 2005',
    ],
    descripcion:
      'Volante central incansable, ganó 4 Copa Libertadores con Boca. Fue pieza central del mediocampo más exitoso de la historia del club. Posteriormente fue entrenador del primer equipo.',
    imageUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/ketktv1740596094.jpg',
    pistas: [
      'Volante de contención que ganó 4 Copa Libertadores',
      'Fue parte del mediocampo más exitoso de la historia xeneize',
      'Su apodo es "El Cacique" y también dirigió al equipo',
    ],
  },
  {
    id: 'gatti',
    nombre: 'Hugo',
    apellido: 'Gatti',
    apodo: 'El Loco',
    posicion: 'Arquero',
    dorsal: '1',
    periodos: ['1980–1988'],
    titulos: ['Metropolitano 1981', 'Nacional 1981', 'Metropolitano 1982'],
    descripcion:
      'Arquero excéntrico y brillante, conocido por salir muy lejos del arco y jugar como un mediocampista. Tricampeón con Boca a principios de los 80. Uno de los más recordados en la historia del club.',
    imageUrl: null,
    pistas: [
      'Arquero conocido por salir hasta el mediocampo con el balón',
      'Fue tricampeón con el club entre 1981 y 1982',
      'Su apodo refleja su personalidad excéntrica e impredecible',
    ],
  },
  {
    id: 'caniggia',
    nombre: 'Claudio',
    apellido: 'Caniggia',
    apodo: 'El Hijo del Viento',
    posicion: 'Extremo / Delantero',
    dorsal: '11',
    periodos: ['1995–1996'],
    titulos: [],
    descripcion:
      'Veloz extremo de melena rubia que llegó a Boca junto a Diego Maradona en 1995. Fue figura de la Selección Argentina en Italia 90 y USA 94. Su velocidad era extraordinaria.',
    imageUrl: null,
    pistas: [
      'Llegó a Boca en 1995 junto a otro grandísimo ídolo',
      'Es conocido mundialmente por su larga cabellera rubia y su velocidad',
      'Su apodo hace referencia directa a su velocidad sobrenatural',
    ],
  },
  {
    id: 'ruggeri',
    nombre: 'Oscar',
    apellido: 'Ruggeri',
    apodo: 'El Cabezón',
    posicion: 'Defensor central',
    dorsal: '6',
    periodos: ['1987–1990'],
    titulos: ['Copa Libertadores 1989', 'Supercopa Sudamericana 1989'],
    descripcion:
      'Campeón del mundo con Argentina en México 86. En Boca ganó la Copa Libertadores 1989. Uno de los defensores más completos y aguerridos de la historia del fútbol argentino.',
    imageUrl: null,
    pistas: [
      'Defensor central que fue campeón del mundo con Argentina en 1986',
      'Ganó la Copa Libertadores con el club en 1989',
      'Su apodo hace referencia a su cabeza prominente y su juego agresivo',
    ],
  },
  {
    id: 'barros_schelotto',
    nombre: 'Guillermo',
    apellido: 'Barros Schelotto',
    apodo: 'El Mellizo',
    posicion: 'Extremo / Delantero',
    dorsal: '7',
    periodos: ['1993–2007'],
    titulos: [
      'Copa Libertadores 2000, 2001, 2003, 2007',
      'Copa Intercontinental 2000',
      'Copa Sudamericana 2004, 2005',
    ],
    descripcion:
      'Símbolo de la era dorada xeneize. Extremo habilidoso que ganó 4 Copa Libertadores. Formó parte del equipo más ganador de la historia junto a su hermano gemelo Gustavo. Luego fue exitoso entrenador del club.',
    imageUrl: null,
    pistas: [
      'Es parte de un par de hermanos gemelos que son ídolos del club',
      'Fue extremo en el equipo más ganador de la historia xeneize',
      'Su apodo hace referencia a que tiene un hermano gemelo',
    ],
  },
  {
    id: 'delgado',
    nombre: 'Marcelo',
    apellido: 'Delgado',
    apodo: 'El Cóndor',
    posicion: 'Extremo / Mediapunta',
    dorsal: '7',
    periodos: ['1993–2000', '2001–2002'],
    titulos: [
      'Copa Libertadores 1999, 2000',
      'Copa Intercontinental 2000',
    ],
    descripcion:
      'Extremo veloz y vertical, parte fundamental del equipo que ganó la Copa Intercontinental 2000 venciendo al Real Madrid. Ganó dos Copa Libertadores consecutivas con el club.',
    imageUrl: null,
    pistas: [
      'Extremo veloz que jugó en el equipo campeón de la Intercontinental 2000',
      'Ganó dos Copa Libertadores consecutivas con el club (1999 y 2000)',
      'Su apodo es el nombre de un ave majestuosa de los Andes',
    ],
  },
  {
    id: 'rojas',
    nombre: 'Ángel Clemente',
    apellido: 'Rojas',
    apodo: 'Rojitas',
    posicion: 'Extremo derecho',
    dorsal: '7',
    periodos: ['1966–1975'],
    titulos: [
      'Metropolitano 1969, 1970, 1976',
      'Nacional 1969, 1970, 1971',
    ],
    descripcion:
      'Ídolo histórico de los años 60 y 70. Extremo desequilibrante, rápido y habilidoso. Ganó seis torneos locales con Boca. Uno de los más grandes jugadores en la historia centenaria del club.',
    imageUrl: null,
    pistas: [
      'Jugó como extremo derecho en Boca durante los años 60 y 70',
      'Fue seis veces campeón local con el club',
      'Su apodo es casi igual a su apellido, pero con el sufijo diminutivo',
    ],
  },
];
