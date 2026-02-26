/**
 * Ídolos históricos del Club Atlético Boca Juniors.
 * Fuente: boca_idols.json — 22 ídolos con datos reales verificados.
 * Usados en el juego "¿Qué ídolo es?" de La 12 Digital.
 */

export type Dificultad = 'facil' | 'media' | 'dificil' | 'muy_dificil';

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
  dificultad: Dificultad;
  era: string;
  /** URL pública del recorte/foto del jugador. null → placeholder estilizado. */
  imageUrl: string | null;
  /** 6 pistas ordenadas de más vaga a más reveladora. */
  pistas: [string, string, string, string, string, string];
}

export const IDOLOS: Idolo[] = [
  // ── FÁCILES ───────────────────────────────────────────────────────────────

  {
    id: 'riquelme',
    nombre: 'Juan Román',
    apellido: 'Riquelme',
    apodo: 'Román',
    posicion: 'Mediocampista ofensivo (enganche)',
    dorsal: '10',
    periodos: ['1996–2002', '2007–2012', '2012–2015'],
    titulos: [
      '3 Copas Libertadores',
      '1 Copa Intercontinental vs Real Madrid (2000)',
      '5 Torneos Apertura',
      'Máximo goleador xeneize en Copa Libertadores (25 goles)',
      'Presidente de Boca desde 2023',
    ],
    descripcion:
      'El 10 más grande de la historia xeneize. Enganche zurdo de juego pausado y elegante que ganó tres Copa Libertadores. Máximo goleador del club en la Libertadores con 25 goles. Hoy es presidente de Boca.',
    dificultad: 'facil',
    era: '2000s-2010s',
    imageUrl: null,
    pistas: [
      'Debutó con 18 años en La Bombonera el 10 de noviembre de 1996 y la multitud lo ovacionó desde el primer día',
      'Fue el arquitecto del 1-0 al Real Madrid de los Galácticos en la final de la Copa Intercontinental del año 2000 en Tokio',
      'Es el máximo goleador xeneize en la historia de la Copa Libertadores con 25 tantos',
      'Jugó brevemente en el FC Barcelona y en el Villarreal, donde llegó a una semifinal histórica de Champions League',
      'Hoy ocupa el sillón más importante del club como presidente desde diciembre de 2023',
      'Su apellido tiene 8 letras y es el más cantado en La Bombonera',
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
      'Máximo goleador histórico del club (236 goles)',
      '2 Copas Libertadores',
      '1 Copa Intercontinental',
      '2 Copas Sudamericanas',
      '6 torneos locales',
    ],
    descripcion:
      'Máximo goleador histórico de Boca con 236 goles. Llegó criticado y se convirtió en leyenda. Su garra, determinación y goles decisivos lo hicieron el símbolo definitivo del atacante xeneize.',
    dificultad: 'facil',
    era: '2000s',
    imageUrl: null,
    pistas: [
      'Es el máximo goleador en toda la historia del club con 236 tantos',
      'Llegó a Boca criticado, pero convirtió 20 goles en sus primeros 19 partidos y no paró más',
      'Erró 3 penales en un mismo partido con Argentina ante Colombia en la Copa América 1999',
      'Jugó en Europa (Villarreal, Alavés y Betis) pero siempre volvió a casa',
      'Anotó goles decisivos en finales de Copa Libertadores que siguen emocionando a los hinchas',
      'Su apodo hace referencia a su enorme estatura y su espíritu indestructible',
    ],
  },

  {
    id: 'maradona',
    nombre: 'Diego Armando',
    apellido: 'Maradona',
    apodo: 'El Pibe de Oro',
    posicion: 'Mediocampista ofensivo / Extremo',
    dorsal: '10',
    periodos: ['1981–1982', '1995–1997'],
    titulos: [
      'Torneo Metropolitano 1981',
      'Campeón del Mundo con Argentina 1986',
    ],
    descripcion:
      'El mejor jugador de la historia del fútbol también eligió a Boca. Ganó el Metropolitano 1981 liderando al equipo con 17 goles. Regresó junto a Caniggia en 1995. Declarado Patrimonio Cultural.',
    dificultad: 'facil',
    era: '1980s-1990s',
    imageUrl: 'https://r2.thesportsdb.com/images/media/player/cutout/v298851606327825.png',
    pistas: [
      'Nació en Villa Fiorito, uno de los barrios más humildes del Gran Buenos Aires',
      'Llegó a Boca en 1981 en uno de los traspasos más costosos de Argentina hasta entonces, desde Argentinos Juniors',
      'En su primera etapa lideró al equipo a ganar el Torneo Metropolitano 1981 con 17 goles',
      'Su golazo a River en La Bombonera bajo la lluvia es una postal eterna',
      'Vistió la camiseta azul y oro en dos etapas, la segunda en 1995 tras su suspensión por dopaje',
      'El mejor jugador de la historia del fútbol mundial también eligió a Boca como su club del corazón',
    ],
  },

  {
    id: 'tevez',
    nombre: 'Carlos',
    apellido: 'Tévez',
    apodo: 'El Apache',
    posicion: 'Delantero',
    dorsal: '11',
    periodos: ['2001–2004', '2015–2019'],
    titulos: [
      'Copa Libertadores 2003 (MVP del torneo)',
      'Copa Intercontinental 2003',
      'Copa Sudamericana 2004',
      'Retorno épico en 2015 para cerrar su carrera en Boca',
    ],
    descripcion:
      'Surgido de las inferiores en el barrio de Fuerte Apache. Ganó la Copa Libertadores 2003 siendo MVP con solo 19 años. Tuvo una carrera estelar en Manchester United, City y Juventus antes de volver a su club.',
    dificultad: 'facil',
    era: '2000s-2010s',
    imageUrl: 'https://r2.thesportsdb.com/images/media/player/cutout/na8lpp1654245743.png',
    pistas: [
      'Debutó en Boca el 21 de octubre de 2001 con apenas 17 años contra Talleres de Córdoba',
      'Fue elegido MVP de la Copa Libertadores 2003, la primera sin Riquelme ni Palermo',
      'Se crio en uno de los barrios más difíciles de Buenos Aires — Fuerte Apache',
      'Tuvo una carrera estelar en Europa: Manchester United, Manchester City, Juventus',
      'En la Juventus fue finalista de la Champions League y uno de los mejores del mundo',
      'Volvió a Boca para cerrar su carrera porque nunca olvidó sus raíces xeneizes',
    ],
  },

  // ── MEDIOS ────────────────────────────────────────────────────────────────

  {
    id: 'battaglia',
    nombre: 'Sebastián',
    apellido: 'Battaglia',
    apodo: 'El León',
    posicion: 'Mediocampista defensivo',
    dorsal: '5',
    periodos: ['1998–2003', '2005–2011'],
    titulos: [
      'Jugador más ganador en la historia de Boca con 17 títulos',
      'Múltiples Libertadores e Intercontinentales',
      'DT campeón de Boca en 2021-2022',
    ],
    descripcion:
      'El jugador con más títulos en la historia del club: 17 conquistas. Motor silencioso del mediocampo en la era dorada de Bianchi. También volvió al club como DT y ganó títulos dirigiendo al primer equipo.',
    dificultad: 'media',
    era: '2000s',
    imageUrl: 'https://r2.thesportsdb.com/images/media/player/thumb/ketktv1740596094.jpg',
    pistas: [
      'Es el jugador con más títulos en la historia del club: 17 conquistas',
      'Surgió de las divisiones inferiores de Boca y nunca jugó en otro club argentino de primera',
      'Era el motor silencioso del mediocampo en la era dorada de Bianchi',
      'Como DT también volvió al club y ganó títulos dirigiendo al primer equipo',
      'Su apellido tiene 9 letras y lleva el número de la batalla',
      'Fue compañero de Riquelme, Palermo y Tévez en la época más gloriosa del club',
    ],
  },

  {
    id: 'barros_schelotto',
    nombre: 'Guillermo',
    apellido: 'Barros Schelotto',
    apodo: 'El Mellizo',
    posicion: 'Delantero / Mediocampista ofensivo',
    dorsal: '7',
    periodos: ['1997–2007'],
    titulos: [
      '2° más ganador como jugador (16 títulos)',
      '4 Copas Libertadores',
      '2 Copas Intercontinentales',
      'Dupla goleadora icónica con Palermo',
    ],
    descripcion:
      'Símbolo de la era dorada xeneize. Gemelo de Gustavo, formó la dupla delantera más recordada junto a Palermo. Ganó 16 títulos. Su habilidad y picardía fueron inseparables de la historia del club.',
    dificultad: 'media',
    era: '2000s',
    imageUrl: null,
    pistas: [
      'Tiene un hermano gemelo (Gustavo) con quien debutó juntos en Boca el 14 de septiembre de 1997',
      'Él y su hermano son conocidos como "Los Mellizos"',
      'Formó la dupla delantera más recordada del club junto a Martín Palermo',
      'Ganó 16 títulos como jugador, siendo el segundo más ganador del club',
      'Después de retirarse fue DT exitoso en México y dirigió a la Selección de Paraguay',
      'Su habilidad técnica y picardía le ganaron el apodo de "Chapita"',
    ],
  },

  {
    id: 'gatti',
    nombre: 'Hugo',
    apellido: 'Gatti',
    apodo: 'El Loco',
    posicion: 'Arquero',
    dorsal: '1',
    periodos: ['1976–1988'],
    titulos: [
      '2 Copas Libertadores (1977 y 1978)',
      '1 Copa Intercontinental (1977)',
      'Récord de partidos en la historia del club: 548',
    ],
    descripcion:
      'El arquero más extravagante del fútbol argentino. Jugó 548 partidos — récord histórico absoluto del club. Salía hasta el mediocampo y tenía su propia hinchada que iba solo para verlo.',
    dificultad: 'media',
    era: '1970s-1980s',
    imageUrl: null,
    pistas: [
      'Es el jugador con más partidos disputados en la historia del club: 548 encuentros',
      'Era conocido por su valentía y habilidad con los pies — muy inusual para un arquero de su época',
      'Defendió el arco de Boca durante más de una década entre los años 1976 y 1988',
      'Tenía su propia hinchada: gente que iba solo a verlo a él jugar',
      'Su estilo extravagante y arriesgado le valió el apodo que es un adjetivo',
      'Fue parte de los equipos que ganaron 2 Libertadores consecutivas en 1977 y 1978',
    ],
  },

  {
    id: 'cordoba',
    nombre: 'Óscar',
    apellido: 'Córdoba',
    apodo: 'El Cóndor',
    posicion: 'Arquero',
    dorsal: '1',
    periodos: ['1999–2006'],
    titulos: [
      'Copa Libertadores 2000 y 2001',
      'Copa Intercontinental 2000 (vs. Real Madrid)',
      'Copa Intercontinental 2003 (vs. AC Milan)',
    ],
    descripcion:
      'Arquero colombiano y arquero titular de toda la era dorada de Bianchi. Ganó 2 Copas Intercontinentales con Boca. Fue parte del legendario trío colombiano junto a Serna y Bermúdez.',
    dificultad: 'media',
    era: '2000s',
    imageUrl: null,
    pistas: [
      'Es colombiano, nació en Magangué, en el departamento de Bolívar',
      'Fue el arquero titular durante la era más gloriosa de Boca bajo el técnico Bianchi',
      'Ganó 2 Copas Intercontinentales con Boca (2000 y 2003)',
      'Su apodo hace referencia a un gran pájaro de los Andes',
      'Fue parte del famoso trío colombiano junto a Serna y Bermúdez',
      'Se convirtió en un ídolo extranjero muy querido por la hinchada xeneize',
    ],
  },

  {
    id: 'serna',
    nombre: 'Mauricio',
    apellido: 'Serna',
    apodo: 'Chicho',
    posicion: 'Mediocampista / Volante',
    dorsal: '8',
    periodos: ['1997–2005'],
    titulos: [
      'Copa Libertadores 2000, 2001, 2003',
      'Copa Intercontinental 2000 y 2003',
    ],
    descripcion:
      'Volante colombiano de enorme entrega y liderazgo. Integrante del célebre trío colombiano de la era dorada. Hacía el trabajo invisible para que brillara Riquelme y sus compañeros.',
    dificultad: 'media',
    era: '2000s',
    imageUrl: null,
    pistas: [
      'Es colombiano, nacido en la ciudad de Montería',
      'Era conocido por su intensidad, entrega y liderazgo en el mediocampo',
      'Fue uno de los tres colombianos que marcaron la era dorada del club',
      'Su apodo es un diminutivo de un nombre que no es el suyo',
      'Hoy trabaja en la dirigencia del fútbol colombiano',
      'Era el gladiador del mediocampo que hacía el trabajo sucio para que brillara Riquelme',
    ],
  },

  {
    id: 'bermudez',
    nombre: 'Jorge',
    apellido: 'Bermúdez',
    apodo: 'El Patrón',
    posicion: 'Defensor central',
    dorsal: '4',
    periodos: ['1998–2003'],
    titulos: [
      'Copa Libertadores 2000, 2001, 2003',
      'Copa Intercontinental 2000',
    ],
    descripcion:
      'Capitán y referente defensivo de la era más gloriosa. Defensor central con personalidad arrolladora. Tercero del legendario trío colombiano junto a Serna y Córdoba. Hoy en la CONMEBOL.',
    dificultad: 'media',
    era: '2000s',
    imageUrl: null,
    pistas: [
      'Es hijo del también futbolista colombiano apodado "Hacha" Bermúdez',
      'Fue capitán de Boca durante la era más gloriosa del club bajo la conducción de Bianchi',
      'Nació en Cartagena de Indias, la ciudad costera más famosa de Colombia',
      'Fue defensor central con personalidad arrolladora que le valió su apodo',
      'Hoy trabaja como miembro del comité de árbitros de la CONMEBOL',
      'Integra el célebre trío colombiano junto a Serna y Córdoba',
    ],
  },

  {
    id: 'navarro_montoya',
    nombre: 'Carlos',
    apellido: 'Navarro Montoya',
    apodo: 'El Mono',
    posicion: 'Arquero',
    dorsal: '1',
    periodos: ['1990–1999'],
    titulos: [
      'Torneo Apertura 1992',
      'Récord de minutos sin goles en contra en la historia del club',
    ],
    descripcion:
      'Arquero emblema de los años 90, sucesor de Gatti. Poseedor del récord de mayor cantidad de minutos sin recibir goles en la historia del club. Tuvo un polémico paso por el FC Barcelona.',
    dificultad: 'media',
    era: '1990s',
    imageUrl: null,
    pistas: [
      'Fue el sucesor de Hugo Gatti en el arco de Boca en la década del noventa',
      'Tiene el récord de mayor cantidad de minutos sin recibir goles en la historia del club',
      'Su apodo hace referencia a su agilidad felina bajo los palos',
      'Fue campeón local en 1992 con el Torneo Apertura',
      'Luego de Boca tuvo un paso polémico por el FC Barcelona de España',
      'Fue referente del arco xeneize durante casi una década completa',
    ],
  },

  // ── DIFÍCILES ─────────────────────────────────────────────────────────────

  {
    id: 'mouzo',
    nombre: 'Roberto',
    apellido: 'Mouzo',
    apodo: 'El Toro',
    posicion: 'Defensor / Lateral',
    dorsal: '6',
    periodos: ['1964–1982'],
    titulos: [
      '2 Copas Libertadores (1977 y 1978)',
      '1 Copa Intercontinental (1977)',
      'MVP de la Copa Libertadores 1977',
    ],
    descripcion:
      'Defensor de hierro que jugó 13 años en el club. Segundo con más partidos oficiales (426). Fue MVP de la Copa Libertadores 1977 y su estatua decora el hall de los ídolos de La Bombonera.',
    dificultad: 'dificil',
    era: '1970s',
    imageUrl: null,
    pistas: [
      'Jugó 13 años en el club y es el segundo con más partidos oficiales: 426',
      'Su estatua está en el interior del club junto a los grandes ídolos',
      'Fue MVP de la Copa Libertadores 1977, ganada ante Cruzeiro',
      'Era símbolo de la década del setenta con enorme garra y corazón xeneize',
      'Su posición era en la defensa y fue capitán en momentos clave',
      'Ganó los mismos títulos internacionales que los equipos del 77 y 78',
    ],
  },

  {
    id: 'rattin',
    nombre: 'Antonio',
    apellido: 'Rattín',
    apodo: 'El Rata',
    posicion: 'Mediocampista / Volante central',
    dorsal: '5',
    periodos: ['1956–1970'],
    titulos: [
      'Capitán histórico y referente durante la era de los 60',
      'Símbolo de la década del 60',
    ],
    descripcion:
      'Pasó toda su carrera profesional en Boca, sin conocer otra camiseta. Capitán de los equipos de los 60. Protagonizó la expulsión más polémica en la historia mundialista, ante Inglaterra en 1966.',
    dificultad: 'dificil',
    era: '1960s',
    imageUrl: null,
    pistas: [
      'Pasó TODA su carrera profesional en Boca — debut en 1956, retiro en 1970, sin conocer otros colores',
      'Era el capitán y referente de los equipos de la década del sesenta',
      'Su temperamento aguerrido y liderazgo lo convirtieron en un ídolo del pueblo',
      'Fue expulsado en el Mundial 1966 de Inglaterra en un partido infame ante los locales',
      'Su apodo es el nombre de un pequeño roedor',
      'Símbolo de la mística y el temperamento xeneize más bravo',
    ],
  },

  {
    id: 'rojas',
    nombre: 'Ángel Clemente',
    apellido: 'Rojas',
    apodo: 'Rojitas',
    posicion: 'Mediocampista ofensivo / Extremo',
    dorsal: '10',
    periodos: ['1959–1972'],
    titulos: [
      '5 títulos locales',
      'Símbolo de los equipos campeones de los 60 y 70',
    ],
    descripcion:
      'Elegante y técnico extremo de los años 60 y 70. Ganó 5 títulos locales y fue referente de una de las mejores generaciones del club. Su humildad y amor por la camiseta lo hicieron ídolo eterno.',
    dificultad: 'dificil',
    era: '1960s-1970s',
    imageUrl: null,
    pistas: [
      'Su apodo es diminutivo de su apellido — lo llamaban con cariño en Boca',
      'Era un jugador elegante y técnico, con habilidad para desequilibrar y asistir',
      'Jugó más de 222 partidos oficiales y convirtió 79 goles para el club',
      'Es uno de los grandes ídolos de la década del sesenta y principios del setenta',
      'Nació en Sarandí, un municipio del conurbano bonaerense',
      'Su humildad y amor por la camiseta lo convirtieron en el más querido por la hinchada',
    ],
  },

  {
    id: 'marzolini',
    nombre: 'Silvio',
    apellido: 'Marzolini',
    apodo: 'El Maestro',
    posicion: 'Lateral izquierdo',
    dorsal: '3',
    periodos: ['1958–1972'],
    titulos: [
      'Títulos de liga 1962, 1964, 1965',
      'Torneos Nacionales 1969 y 1970',
      'Copa Argentina 1969',
    ],
    descripcion:
      'Considerado el mejor lateral izquierdo de la historia del club. Pilar en los títulos de la era dorada de los 60. Luego fue DT y condujo al equipo campeón del Metropolitano 1981 con Maradona.',
    dificultad: 'dificil',
    era: '1960s',
    imageUrl: null,
    pistas: [
      'Considerado quizás el mejor lateral izquierdo en la historia de Boca Juniors',
      'Fue pilar en los títulos de 1962, 1964 y 1965 — era dorada de los sesenta',
      'Su elegancia al atacar por el carril izquierdo era característica de su estilo de juego',
      'Más tarde fue DT de Boca y tuvo a Maradona a su cargo en el año 1981',
      'Su nombre tiene solo 6 letras en el apellido',
      'Nació en 1940 y defendió la camiseta azul y oro durante más de una década',
    ],
  },

  {
    id: 'palacio',
    nombre: 'Rodrigo',
    apellido: 'Palacio',
    apodo: 'El Trenza',
    posicion: 'Delantero / Extremo',
    dorsal: '11',
    periodos: ['2004–2009'],
    titulos: [
      'Máximo goleador histórico de la Recopa Sudamericana',
    ],
    descripcion:
      'Patagónico de Rawson, Chubut. Máximo goleador en la historia de la Recopa Sudamericana. Brilló en Europa con Inter de Milán y Bologna. Su trenza era tan icónica como su juego.',
    dificultad: 'dificil',
    era: '2000s',
    imageUrl: null,
    pistas: [
      'Nació en Rawson, la capital de Chubut, en la Patagonia argentina',
      'Es el máximo goleador histórico de la Recopa Sudamericana',
      'Luego de Boca tuvo una larga carrera en Europa: Atlético de Madrid, Inter de Milán, Bologna',
      'Su apodo hace referencia a su peinado característico e inconfundible',
      'Jugó la final con la Selección Argentina en el Mundial de Brasil 2014',
      'Su caída en la final de la Copa del Mundo 2014 contra Alemania es uno de los momentos más recordados',
    ],
  },

  // ── MUY DIFÍCILES ─────────────────────────────────────────────────────────

  {
    id: 'varallo',
    nombre: 'Francisco',
    apellido: 'Varallo',
    apodo: 'Cañoncito',
    posicion: 'Delantero',
    dorsal: '?',
    periodos: ['1930–1939'],
    titulos: [
      '3 títulos de liga (1930s)',
      'Participó en la final del Mundial 1930 con Argentina',
    ],
    descripcion:
      'El primer gran goleador del Boca profesional. Jugó la final del primer Mundial de la historia (Uruguay 1930). Vivió más de 100 años y fue el último jugador sobreviviente de aquel histórico torneo.',
    dificultad: 'muy_dificil',
    era: '1930s',
    imageUrl: null,
    pistas: [
      'Fue el máximo goleador de la historia del club hasta que llegó Roberto Cherro a superarlo',
      'Jugó en la final del primer Mundial de la historia en Uruguay 1930 con Argentina',
      'Sus goles en la década del treinta eran celebrados con remates de enorme potencia',
      'Su apodo hace referencia al tamaño pequeño pero explosivo de su disparo',
      'Primer ídolo goleador del Boca profesional en la era de los años treinta',
      'Vivió más de 100 años y fue el último sobreviviente del primer Mundial de la historia',
    ],
  },

  {
    id: 'cherro',
    nombre: 'Roberto',
    apellido: 'Cherro',
    apodo: 'El Torito',
    posicion: 'Delantero',
    dorsal: '?',
    periodos: ['1924–1938'],
    titulos: [
      '2° máximo goleador histórico del club (221 goles)',
      'Múltiples títulos en la era amateur e inicios del profesionalismo',
    ],
    descripcion:
      'Segundo máximo goleador histórico del club con 221 goles. Fue el récord hasta que Palermo lo superó en 2009. Formó la delantera más temida del fútbol argentino de los años 20 y 30.',
    dificultad: 'muy_dificil',
    era: '1930s',
    imageUrl: null,
    pistas: [
      'Es el segundo goleador en la historia del club con 221 tantos',
      'Fue el máximo goleador histórico hasta que Martín Palermo lo superó en el año 2009',
      'Jugó en la década del veinte y del treinta — los inicios del profesionalismo argentino',
      'Formó una tripleta goleadora temible junto a Varallo y Benítez Cáceres',
      'Su apodo alude al carácter bravo y potente de su juego',
      'Lleva el mismo apellido que un riachuelo del sur de la provincia de Buenos Aires',
    ],
  },

  {
    id: 'valentim',
    nombre: 'Paulo',
    apellido: 'Valentim',
    apodo: 'El Verdugo',
    posicion: 'Delantero',
    dorsal: '?',
    periodos: ['1958–1964'],
    titulos: [
      'Títulos de liga 1962 y 1964',
      'Récord de 10 goles ante River Plate (récord histórico individual)',
    ],
    descripcion:
      'Delantero brasileño con el récord histórico de más goles ante River Plate: 10 en Superclásicos. Ídolo extranjero muy amado en los años 60. Jugó en el Boca de los primeros títulos de la era moderna.',
    dificultad: 'muy_dificil',
    era: '1960s',
    imageUrl: null,
    pistas: [
      'Es brasileño, nacido en la ciudad de Río de Janeiro',
      'Tiene el récord de más goles convertidos ante River Plate por un solo jugador (10 goles)',
      'Por esa razón su apodo implica que castigó duramente al eterno rival',
      'Jugó en Boca entre 1958 y 1964 — era de los títulos de los primeros sesenta',
      'Es uno de los extranjeros más queridos en la historia del club',
      'Su apellido es también un nombre propio muy común en el mundo hispano',
    ],
  },

  {
    id: 'benitez_caceres',
    nombre: 'Delfín',
    apellido: 'Benítez Cáceres',
    apodo: 'El Paraguayo',
    posicion: 'Delantero',
    dorsal: '?',
    periodos: ['1930–1939'],
    titulos: [
      'Múltiples títulos de liga en la era amateur y primeros años profesionales',
      'El extranjero con más goles en la historia del club',
    ],
    descripcion:
      'El extranjero con más goles en la historia del club. Paraguayo que integró la delantera letal de los años 30 junto a Cherro y Varallo. Una de las figuras más desconocidas entre los goleadores históricos.',
    dificultad: 'muy_dificil',
    era: '1930s',
    imageUrl: null,
    pistas: [
      'Es el extranjero con más goles convertidos en la historia del club',
      'Es paraguayo, nacido en la ciudad de Asunción',
      'Integró la delantera letal de los años treinta junto a Cherro y Varallo',
      'Su apellido compuesto tiene dos partes — el primero es también una palabra del mar',
      'Jugó en la era amateur y los comienzos del profesionalismo argentino',
      'Es una de las figuras más desconocidas entre los grandes goleadores históricos del Xeneize',
    ],
  },

  {
    id: 'melendez',
    nombre: 'Julio',
    apellido: 'Meléndez',
    apodo: 'El Zurdo',
    posicion: 'Lateral izquierdo',
    dorsal: '?',
    periodos: ['1965–1975'],
    titulos: [
      'Campeonatos locales de 1964, 1965, 1969 y 1970',
      'Primera gran aventura continental (Copa Libertadores 1963)',
    ],
    descripcion:
      'Lateral izquierdo peruano que fue capitán en la primera gran aventura continental de Boca. Ganó 4 títulos de liga en los 60 y 70. Uno de los pocos ídolos peruanos en la historia xeneize.',
    dificultad: 'muy_dificil',
    era: '1960s-1970s',
    imageUrl: null,
    pistas: [
      'Es peruano, nacido en Lima — uno de los pocos ídolos xeneizes de ese país',
      'Fue capitán del equipo durante la primera gran aventura continental del club en la Libertadores',
      'Se destacaba como lateral izquierdo con enorme proyección ofensiva',
      'Ganó 4 títulos de liga con el club en la era de los sesenta y setenta',
      'Su apellido es muy común en el mundo hispano',
      'Participó en la histórica Copa Libertadores 1963 donde Boca llegó muy lejos',
    ],
  },

  {
    id: 'rendo',
    nombre: 'Eduardo',
    apellido: 'Rendo',
    apodo: 'El Atómico',
    posicion: 'Delantero',
    dorsal: '?',
    periodos: ['1934–1944'],
    titulos: [
      '6 títulos con Boca (incluyendo 2 a principios de los 40)',
      'Venció a "La Máquina" de River en la época de mayor gloria millonaria',
    ],
    descripcion:
      'Delantero explosivo de la era del 40, conocido por enfrentar y vencer a "La Máquina" de River. Ganó 6 títulos entre 1934 y 1944. Una leyenda casi olvidada del fútbol argentino de mediados del siglo XX.',
    dificultad: 'muy_dificil',
    era: '1940s',
    imageUrl: null,
    pistas: [
      'Su apodo hace referencia a algo extremadamente poderoso y explosivo',
      'Era conocido por tener uno de los remates más potentes del fútbol de su época',
      'Venció con Boca nada menos que a "La Máquina", el River más grande de la historia',
      'Ganó 6 títulos en la era del cuarenta — considerado el mejor de su generación en el ataque',
      'Está entre los máximos goleadores del club en la era amateur y semi-profesional',
      'Su apellido tiene solo 5 letras',
    ],
  },
];
