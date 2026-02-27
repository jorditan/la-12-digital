/**
 * Ídolos históricos del Club Atlético Boca Juniors.
 * Fuente: boca_idols.json — datos verificados.
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
    periodos: ['1996–2002', '2007', '2008–2014'],
    titulos: [
      '3 Copas Libertadores',
      '1 Copa Intercontinental vs Real Madrid (2000)',
      '5 Torneos Apertura/Clausura',
      'Máximo goleador xeneize en Copa Libertadores (25 goles)',
      'Presidente de Boca desde 2023',
    ],
    descripcion:
      'El 10 más grande de la historia xeneize. Enganche zurdo de juego pausado y elegante que ganó tres Copas Libertadores. Máximo goleador del club en la Libertadores con 25 goles. Hoy es presidente de Boca.',
    dificultad: 'facil',
    era: '2000s-2010s',
    imageUrl: null,
    pistas: [
      'Debutó con 18 años en La Bombonera el 10 de noviembre de 1996 y la multitud lo ovacionó desde el primer día',
      'Es el máximo goleador xeneize en la historia de la Copa Libertadores con 25 tantos',
      'Jugó en el FC Barcelona y en el Villarreal, donde llegó a una semifinal histórica de Champions League',
      'Fue el gran enganche de la etapa más gloriosa, máximo goleador en la Libertadores y actual presidente del club',
      'Le hizo a un defensor de River Plate uno de los caños más famosos de la historia del fútbol',
      'En el partido de vuelta de la final de la Copa Libertadores 2007, le marcó un doblete inolvidable al Gremio en Brasil para consagrar al equipo',
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
      'Es el máximo goleador en toda la historia del club',
      'Llegó a Boca criticado pero convirtió 20 goles en sus primeros 19 partidos y no paró más',
      'Erró 3 penales en un mismo partido con Argentina ante Colombia en la Copa América 1999',
      'Marcó un total de 236 goles en competiciones oficiales con la camiseta azul y oro',
      'Le marcó dos tantos inolvidables al Real Madrid en Japón durante los primeros seis minutos en la Copa Intercontinental',
      'Volvió a jugar tras estar seis meses inactivo por una severa lesión, y en su regreso le convirtió un gol histórico a River por la Libertadores',
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
      'En su primera etapa lideró al equipo a ganar el Torneo Metropolitano 1981 con 17 goles',
      'Vistió la camiseta azul y oro en dos etapas, la segunda en 1995 junto a Caniggia',
      'Llegó al club en 1981 rechazando una oferta millonaria del clásico rival porque su gran sueño era vestir esta camiseta',
      'En su debut oficial el 22 de febrero de 1981 ante Talleres de Córdoba tuvo una actuación brillante marcando dos goles de penal',
      'Tuvo un partido de despedida en el estadio en el año 2001, donde dejó una frase eterna expresando que "la pelota no se mancha"',
    ],
  },

  {
    id: 'tevez',
    nombre: 'Carlos',
    apellido: 'Tévez',
    apodo: 'El Apache',
    posicion: 'Delantero',
    dorsal: '11',
    periodos: ['2001–2004', '2015–2016', '2018–2021'],
    titulos: [
      'Copa Libertadores 2003 (MVP del torneo)',
      'Copa Intercontinental 2003',
      'Copa Sudamericana 2004',
      '11 títulos en total en sus tres etapas',
    ],
    descripcion:
      'Surgido de las inferiores en el barrio de Fuerte Apache. Ganó la Copa Libertadores 2003 siendo MVP con solo 19 años. Tuvo una carrera estelar en Manchester United, City y Juventus antes de volver a su club.',
    dificultad: 'facil',
    era: '2000s-2010s',
    imageUrl: 'https://r2.thesportsdb.com/images/media/player/cutout/na8lpp1654245743.png',
    pistas: [
      'Se crio en uno de los barrios más difíciles de Buenos Aires — Fuerte Apache',
      'Fue elegido MVP de la Copa Libertadores 2003 con solo 19 años',
      'Tuvo una carrera estelar en Europa: Manchester United, Manchester City, Juventus',
      'Debutó en 2001, fue campeón de la Intercontinental 2003 y regresó de Europa en su plenitud para cerrar su carrera',
      'En las semifinales de la Copa Libertadores 2004 anotó un gol decisivo en el Monumental e hizo un sancionado festejo imitando a una gallina',
      'Logró cosechar un total de 11 títulos con la institución a lo largo de sus tres etapas diferentes en el club',
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
    periodos: ['1998–2011'],
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
      'Surgió de las divisiones inferiores de Boca y nunca jugó en otro club argentino de primera',
      'Era el motor silencioso del mediocampo en la era dorada de Bianchi junto a Riquelme y Palermo',
      'Fue compañero de Riquelme, Palermo y Tévez en la época más gloriosa del club',
      'Surgido de las divisiones inferiores, es el futbolista que más títulos oficiales ganó en toda la historia del club con 17 campeonatos',
      'En una mítica victoria ante el clásico rival en el año 2000, desbordó por el costado y dio la asistencia para el tercer gol histórico',
      'Años después de retirarse, regresó como director técnico del primer equipo y sumó a su palmarés la Copa Argentina y la Copa de la Liga',
    ],
  },

  {
    id: 'abbondanzieri',
    nombre: 'Roberto',
    apellido: 'Abbondanzieri',
    apodo: 'El Pato',
    posicion: 'Arquero',
    dorsal: '1',
    periodos: ['1997–2006', '2009–2010'],
    titulos: [
      'Copa Libertadores 2000, 2001, 2003',
      'Copa Intercontinental 2000 y 2003',
      'Copa Sudamericana 2005',
    ],
    descripcion:
      'Arquero titular de la era dorada de Bianchi. Héroe en la Copa Intercontinental 2003 atajando dos penales al Milan. Cerró la Sudamericana 2005 convirtiendo el penal decisivo desde los doce pasos.',
    dificultad: 'media',
    era: '2000s',
    imageUrl: null,
    pistas: [
      'Fue arquero titular de Boca durante casi una década, en la era más exitosa del club',
      'Ganó la Copa Libertadores en tres ocasiones y dos Copas Intercontinentales',
      'Se destacó por su templanza en tandas de penales tanto atajando como ejecutando remates decisivos',
      'Portero que se consolidó como titular indiscutible en la época más ganadora, tras la salida del arquero anterior',
      'En la Copa Intercontinental del año 2003 frente al Milan, se transformó en la gran figura al atajar dos penales decisivos en la tanda',
      'Demostró su templanza en la final de la Copa Sudamericana 2005 al decidir ejecutar y convertir el remate definitivo que selló el campeonato',
    ],
  },

  {
    id: 'bianchi',
    nombre: 'Carlos',
    apellido: 'Bianchi',
    apodo: 'El Virrey',
    posicion: 'Director Técnico',
    dorsal: '-',
    periodos: ['1998–2004', '2013–2014'],
    titulos: [
      '9 títulos oficiales como DT',
      '3 Copas Libertadores',
      '2 Copas Intercontinentales (vs. Real Madrid y AC Milan)',
      'Récord de 40 partidos invictos consecutivos',
    ],
    descripcion:
      'El entrenador más laureado en la historia de Boca con 9 títulos oficiales. Condujo al equipo a ganar 3 Copas Libertadores y 2 Copas Intercontinentales, siendo el único DT en conseguirlo.',
    dificultad: 'media',
    era: '2000s',
    imageUrl: null,
    pistas: [
      'Es el entrenador más ganador de la historia del club',
      'Fue delantero goleador en Europa (Reims, Vélez) antes de dedicarse a dirigir',
      'Dirigió al equipo durante las temporadas más gloriosas a nivel internacional',
      'Es el entrenador más laureado de la historia del club con un impresionante total de 9 títulos oficiales',
      'Bajo su brillante conducción el equipo ganó 3 Copas Libertadores y se coronó bicampeón del mundo al derrotar al Real Madrid y al Milan',
      'Condujo al plantel que estableció el récord de 40 partidos invictos consecutivos en el campeonato argentino',
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
      'DT bicampeón local 2016–2018',
    ],
    descripcion:
      'Símbolo de la era dorada xeneize. Gemelo de Gustavo, formó la dupla delantera más recordada junto a Palermo. Ganó 16 títulos como jugador. Como DT condujo al bicampeonato local 2016-2018.',
    dificultad: 'media',
    era: '2000s',
    imageUrl: null,
    pistas: [
      'Tiene un hermano gemelo (Gustavo) con quien debutó juntos en Boca el 14 de septiembre de 1997',
      'Formó la dupla delantera más recordada del club junto a Martín Palermo durante una década',
      'Ganó 16 títulos como jugador, siendo el segundo más ganador del club',
      'Habilidoso extremo que formó una temible dupla ofensiva junto al máximo goleador histórico durante toda una década de éxitos',
      'Regresó años más tarde como director técnico y logró darle a la institución un sólido bicampeonato de liga entre 2016 y 2018',
      'Su gran picardía y talento para irritar a las defensas solía resultar en amonestaciones y expulsiones para los jugadores rivales',
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
      '417 partidos — segundo récord histórico del club',
    ],
    descripcion:
      'El arquero más extravagante del fútbol argentino. Jugó 417 partidos — segundo récord histórico absoluto del club. Salía hasta el mediocampo y tenía su propia hinchada que iba solo para verlo.',
    dificultad: 'media',
    era: '1970s-1980s',
    imageUrl: null,
    pistas: [
      'Es el segundo jugador con más partidos disputados en la historia del club: 417 encuentros',
      'Era conocido por su valentía y habilidad con los pies — muy inusual para un arquero de su época',
      'Tenía su propia hinchada: gente que iba al estadio solo a verlo a él jugar',
      'Es el segundo jugador con más presencias absolutas en la historia de la institución totalizando 417 partidos jugados',
      'Atajó el penal decisivo contra el Cruzeiro de Brasil en 1977, dándole al club su primera Copa Libertadores',
      'Tenía un estilo poco convencional para su puesto, arriesgándose a salir constantemente del área y jugando con los pies como un defensor más',
    ],
  },

  {
    id: 'cordoba',
    nombre: 'Óscar',
    apellido: 'Córdoba',
    apodo: 'El Cóndor',
    posicion: 'Arquero',
    dorsal: '1',
    periodos: ['1997–2001'],
    titulos: [
      'Copa Libertadores 2000 y 2001',
      'Copa Intercontinental 2000 (vs. Real Madrid)',
    ],
    descripcion:
      'Arquero colombiano y titular de la primera era dorada de Bianchi. Héroe en las semifinales ante Palmeiras en 2000. Parte del legendario trío colombiano junto a Serna y Bermúdez.',
    dificultad: 'media',
    era: '2000s',
    imageUrl: null,
    pistas: [
      'Es colombiano — integró el famoso trío junto a Serna y Bermúdez',
      'Fue el arquero titular durante la primera era gloriosa de Boca bajo el técnico Bianchi',
      'Su apodo hace referencia a un gran pájaro de los Andes',
      'Extranjero que fue un pilar en la etapa más gloriosa, fundamental en las tandas de penales de las Copas Libertadores 2000 y 2001',
      'Fue el inmenso héroe en las semifinales de la Libertadores del año 2000 frente al Palmeiras en Brasil, deteniendo dos remates cruciales',
      'Gracias a su gran actuación y seguridad bajo los tres palos, el equipo venció al poderoso Real Madrid en la Intercontinental del año 2000',
    ],
  },

  {
    id: 'navarro_montoya',
    nombre: 'Carlos',
    apellido: 'Navarro Montoya',
    apodo: 'El Mono',
    posicion: 'Arquero',
    dorsal: '1',
    periodos: ['1988–1996'],
    titulos: [
      'Supercopa 1989',
      'Torneo Apertura 1992',
      'Récord de 824 minutos sin recibir goles',
    ],
    descripcion:
      'Arquero emblema de los años 90. Poseedor del récord de 824 minutos sin recibir goles. Jugó 400 partidos. Tuvo un polémico paso por el FC Barcelona.',
    dificultad: 'media',
    era: '1990s',
    imageUrl: null,
    pistas: [
      'Fue el arquero referente de Boca durante casi ocho temporadas ininterrumpidas en los años 80 y 90',
      'Su apodo hace referencia a su agilidad felina bajo los palos',
      'Luego de Boca tuvo un paso polémico por el FC Barcelona de España',
      'Alcanzó la impresionante marca de 400 partidos resguardando el arco y atajó un penal decisivo en la final de la Supercopa de 1989',
      'Ostentó el récord absoluto de la valla invicta sumando 824 minutos sin recibir goles',
      'Fue la cara visible del arco de la institución durante casi ocho temporadas entre finales de los años 80 y la mitad de los 90',
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
    periodos: ['1971–1984'],
    titulos: [
      '2 Copas Libertadores (1977 y 1978)',
      '1 Copa Intercontinental (1977)',
      'Récord histórico de presencias: 426 partidos',
    ],
    descripcion:
      'Defensor de hierro y dueño del récord absoluto de presencias en el club con 426 partidos. Pilar en los equipos campeones de los 70. Su estatua decora el hall de los ídolos de La Bombonera.',
    dificultad: 'dificil',
    era: '1970s',
    imageUrl: null,
    pistas: [
      'Su estatua está en el hall de ídolos del club junto a las grandes leyendas históricas',
      'Era símbolo de la década del setenta con enorme garra y corazón xeneize',
      'Fue parte de los equipos que ganaron las dos primeras Copas Libertadores del club',
      'Ningún otro jugador se puso tantas veces la camiseta del club — es el dueño del récord absoluto de presencias con 426 partidos',
      'Es uno de los máximos emblemas forjados en las divisiones inferiores y conserva su récord intocable',
      'Fue un pilar indiscutible en la defensa y defendió los colores de manera ininterrumpida desde principios de los 70 hasta mediados de los 80',
    ],
  },

  {
    id: 'sune',
    nombre: 'Rubén',
    apellido: 'Suñé',
    apodo: 'El Colo',
    posicion: 'Mediocampista / Volante central',
    dorsal: '8',
    periodos: ['1967–1980'],
    titulos: [
      '2 Copas Libertadores (1977 y 1978)',
      '1 Copa Intercontinental (1977)',
      'Torneo Nacional 1976',
    ],
    descripcion:
      'Capitán del equipo más ganador de los 70. Autor del golazo de tiro libre en la final del Torneo Nacional 1976 ante River. Lideró el equipo a ganar las dos primeras Copas Libertadores.',
    dificultad: 'dificil',
    era: '1970s',
    imageUrl: null,
    pistas: [
      'Fue capitán y referente del equipo que ganó las primeras dos Copas Libertadores de la historia del club',
      'Jugó en el mediocampo durante más de una década, siendo figura indiscutida de los años 70',
      'Su liderazgo y entrega lo convirtieron en uno de los jugadores más queridos de su generación',
      'Autor de un histórico gol de tiro libre directo que definió la final del Torneo Nacional 1976 frente al eterno rival',
      'Ejerció como el gran capitán del equipo que ganó las primeras dos Copas Libertadores de la institución en los años 70',
      'Tras retirarse del fútbol atravesó una profunda depresión que lo llevó a intentar quitarse la vida arrojándose de un séptimo piso, pero afortunadamente se recuperó',
    ],
  },

  {
    id: 'serna',
    nombre: 'Mauricio',
    apellido: 'Serna',
    apodo: 'Chicho',
    posicion: 'Mediocampista / Volante',
    dorsal: '8',
    periodos: ['1998–2002'],
    titulos: [
      'Copa Libertadores 2000, 2001, 2003',
      'Copa Intercontinental 2000 y 2003',
    ],
    descripcion:
      'Volante colombiano de enorme entrega y liderazgo. Integrante del célebre trío colombiano de la era dorada. Hacía el trabajo invisible para que brillara Riquelme y sus compañeros.',
    dificultad: 'dificil',
    era: '2000s',
    imageUrl: null,
    pistas: [
      'Es colombiano — parte del famoso trío junto a Bermúdez y Córdoba',
      'Era el gladiador del mediocampo que hacía el trabajo sucio para que brillara Riquelme',
      'Su intensidad, entrega y liderazgo lo convirtieron en uno de los extranjeros más ovacionados',
      'Fue el incansable motor del mediocampo del equipo multicampeón a nivel internacional en el inicio de la década de los 2000',
      'Aunque fue clave en la época de mayores triunfos internacionales, el técnico que originalmente solicitó su incorporación fue Héctor Veira',
      'Su estilo de gran quite y fiereza lo transformó rápidamente en uno de los jugadores extranjeros más ovacionados por la tribuna popular',
    ],
  },

  {
    id: 'bermudez',
    nombre: 'Jorge',
    apellido: 'Bermúdez',
    apodo: 'El Patrón',
    posicion: 'Defensor central',
    dorsal: '4',
    periodos: ['1997–2001'],
    titulos: [
      'Copa Libertadores 2000 y 2001',
      'Copa Intercontinental 2000',
    ],
    descripcion:
      'Capitán y referente defensivo de la era más gloriosa. Defensor central con personalidad arrolladora. Tercer colombiano del trío legendario junto a Serna y Córdoba. Hoy en la CONMEBOL.',
    dificultad: 'dificil',
    era: '2000s',
    imageUrl: null,
    pistas: [
      'Es colombiano, nacido en Cartagena de Indias — parte del trío colombiano junto a Serna y Córdoba',
      'Fue capitán de Boca durante la era más gloriosa bajo la conducción de Bianchi',
      'Hoy trabaja como miembro del comité de árbitros de la CONMEBOL',
      'Fiero central extranjero que ejecutó el último penal en Brasil para ganar la Libertadores en el mítico estadio Morumbí en el año 2000',
      'El reconocido técnico Carlos Salvador Bilardo fue quien insistió expresamente para ficharlo en la década del 90',
      'Fue el gran capitán y líder de la defensa que logró consagrarse campeona del mundo en Japón venciendo a un equipo europeo',
    ],
  },

  {
    id: 'schiavi',
    nombre: 'Rolando',
    apellido: 'Schiavi',
    apodo: 'El Chavo',
    posicion: 'Defensor central',
    dorsal: '4',
    periodos: ['2001–2005', '2011–2012'],
    titulos: [
      'Copa Libertadores 2003',
      'Copa Intercontinental 2003',
      'Torneo Apertura 2011 (invicto)',
    ],
    descripcion:
      'Zaguero central de gran jerarquía, columna vertebral defensiva del 2003. Convirtió el penal decisivo ante el Milan en la Intercontinental de Japón. Volvió para ganar el Apertura 2011 de manera invicta.',
    dificultad: 'dificil',
    era: '2000s',
    imageUrl: null,
    pistas: [
      'Fue zaguero central de gran jerarquía en los equipos campeones del 2003',
      'Defendió la camiseta de Boca en dos etapas distintas y ganó títulos en ambas',
      'Se ganó el respeto de la hinchada por su contundencia y entrega en el juego aéreo',
      'Férreo zaguero central que fue la columna vertebral defensiva en múltiples campeonatos de la etapa internacional de la década de 2000',
      'Asumió la pesada responsabilidad de ejecutar y convertir su penal en la histórica definición intercontinental contra un equipo italiano en Japón',
      'Regresó al club en su etapa final y fue el pilar de la sólida defensa que obtuvo el Torneo Apertura 2011 de manera invicta',
    ],
  },

  {
    id: 'delgado',
    nombre: 'Marcelo',
    apellido: 'Delgado',
    apodo: 'Chelo',
    posicion: 'Delantero',
    dorsal: '11',
    periodos: ['2000–2003', '2005–2006'],
    titulos: [
      'Copa Libertadores 2001 (gol en la final ante Cruz Azul)',
      'Copa Intercontinental 2001',
      'Copa Libertadores 2003',
    ],
    descripcion:
      'Delantero desequilibrante de la era dorada. Autor del gol del 1-0 en la primera final de la Libertadores 2001 ante Cruz Azul. Su pase largo habilitó a Palermo ante el Real Madrid en Tokio.',
    dificultad: 'dificil',
    era: '2000s',
    imageUrl: null,
    pistas: [
      'Fue uno de los delanteros de la era dorada, compañero de Riquelme y Palermo',
      'Era conocido por su habilidad técnica y la precisión de sus centros con el exterior del pie',
      'Jugó en los equipos que ganaron Copas Libertadores e Intercontinentales en los primeros 2000',
      'Atacante sumamente desequilibrante que le dio el triunfo al equipo por 1-0 frente a Cruz Azul en la primera final de la Libertadores 2001',
      'Fue el autor del pase magistral de larga distancia que permitió abrir el marcador en los primeros minutos frente al Real Madrid en Tokio',
      'Su inconfundible sello técnico consistía en golpear y centrar la pelota de forma muy precisa utilizando la cara externa de su botín derecho',
    ],
  },

  {
    id: 'ibarra',
    nombre: 'Hugo',
    apellido: 'Ibarra',
    apodo: 'El Negro',
    posicion: 'Lateral derecho',
    dorsal: '2',
    periodos: ['1998–2001', '2002–2003', '2005–2010'],
    titulos: [
      'Copa Libertadores 2000, 2001, 2003, 2007',
      'Copa Intercontinental 2000 y 2003',
      'Copa de la Liga 2022 (como DT)',
    ],
    descripcion:
      'Lateral derecho que participó en casi todos los éxitos del club desde 1998. Marcó un golazo desde afuera en la final de la Libertadores 2007. Como DT ganó la Copa de la Liga 2022.',
    dificultad: 'dificil',
    era: '2000s',
    imageUrl: null,
    pistas: [
      'Fue lateral derecho durante la era más gloriosa del club, desde finales de los 90',
      'Participó en las Copas Libertadores más recordadas de la historia xeneize',
      'Tras retirarse como jugador, continuó vinculado al club asumiendo un rol importante',
      'Formidable lateral derecho que participó en la gran mayoría de los éxitos locales e internacionales del club a partir del año 1998',
      'Después de finalizar su etapa como futbolista, dirigió al primer equipo y conquistó el Torneo de la Liga y la Supercopa en 2022',
      'Marcó un espectacular gol desde fuera del área con pierna izquierda en el partido de vuelta de la final de la Copa Libertadores del año 2007',
    ],
  },

  {
    id: 'martinez_sergio',
    nombre: 'Sergio',
    apellido: 'Martínez',
    apodo: 'El Pato',
    posicion: 'Delantero centro',
    dorsal: '9',
    periodos: ['1992–1997'],
    titulos: [
      'Torneo Apertura 1992',
      'Torneo Clausura 1995',
    ],
    descripcion:
      'Goleador uruguayo ídolo de los 90. Fue determinante para acabar con 11 años sin títulos locales ganando el Apertura 1992. Famoso por trepar al alambrado para festejar su gol en el Superclásico.',
    dificultad: 'dificil',
    era: '1990s',
    imageUrl: null,
    pistas: [
      'Fue un goleador uruguayo muy querido por la hinchada en la década del noventa',
      'Sus goles fueron determinantes para acabar con una racha de más de una década sin campeonatos locales',
      'Era una referencia de área conocida por su potencia, empuje y gol en momentos decisivos',
      'Goleador uruguayo ídolo en los años 90, muy recordado por treparse a lo alto del alambrado para festejar un tanto en un Superclásico',
      'Cuando contó su experiencia colgado del alambrado, bromeó con que casi tira toda la tribuna abajo debido a su peso de 95 kilos',
      'Sus goles y empuje fueron determinantes para que el equipo lograra salir campeón del Torneo Apertura 1992, rompiendo una sequía de once años',
    ],
  },

  {
    id: 'giunta',
    nombre: 'Blas',
    apellido: 'Giunta',
    apodo: 'Bichi',
    posicion: 'Mediocampista',
    dorsal: '6',
    periodos: ['1989–1997'],
    titulos: [
      'Supercopa 1989',
      'Torneo Apertura 1992',
    ],
    descripcion:
      'Mediocampista símbolo del sacrificio en los equipos de los 90. Convirtió el penal que cerró la Supercopa 1989. Su apellido era coreado desde la tribuna con una palabra que exaltaba su coraje.',
    dificultad: 'dificil',
    era: '1990s',
    imageUrl: null,
    pistas: [
      'Fue mediocampista de enorme sacrificio y entrega en los equipos boquenses de los años 90',
      'Era muy exigente consigo mismo y con sus compañeros — un guerrero dentro del campo',
      'La hinchada lo quería mucho por su despliegue y coraje en cada partido',
      'Símbolo total del sacrificio; convirtió el último penal que le dio el título de la Supercopa al equipo en el año 1989',
      'Exigía tanto a sus compañeros que les gritaba enfurecido a los laterales para que tiraran bien los centros, amenazando con patearlos en las prácticas',
      'Su apellido era habitualmente coreado desde las tribunas acompañado de una palabra particular que resaltaba su coraje y enorme despliegue',
    ],
  },

  {
    id: 'marcico',
    nombre: 'Alberto',
    apellido: 'Márcico',
    apodo: 'Beto',
    posicion: 'Mediocampista ofensivo',
    dorsal: '10',
    periodos: ['1992–1995'],
    titulos: [
      'Torneo Apertura 1992',
      'Torneo Clausura 1995',
    ],
    descripcion:
      'Armador elegante que dejó Europa para cumplir su sueño de jugar en Boca. Conductor del equipo que ganó el Apertura 1992, primera liga en 11 años. Famoso por proteger la pelota con maestría.',
    dificultad: 'dificil',
    era: '1990s',
    imageUrl: null,
    pistas: [
      'Fue mediocampista ofensivo y conductor del equipo en los primeros años de la década del noventa',
      'Era conocido por su visión de juego y su capacidad para crear y distribuir desde el mediocampo',
      'Tenía gran fortaleza física que usaba para proteger la pelota y resistir la presión rival',
      'Talentoso armador que abandonó su carrera en el fútbol europeo movilizado exclusivamente por su gran sueño de jugar con estos colores',
      'Ejerció como el indiscutible conductor y eje del equipo que se adjudicó el Apertura 1992, acabando con una racha de más de una década sin ligas',
      'Hacía valer su robustez física para proteger la pelota con gran maestría, aguantando las fuertes faltas de los defensores rivales en cada partido',
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
      'Capitán histórico durante la era de los 60',
      'Múltiples títulos de liga en los 60',
    ],
    descripcion:
      'Pasó toda su carrera profesional en Boca, sin conocer otra camiseta. Capitán de los equipos de los 60. Protagonizó la expulsión más polémica en la historia mundialista, ante Inglaterra en 1966.',
    dificultad: 'dificil',
    era: '1960s',
    imageUrl: null,
    pistas: [
      'Pasó TODA su carrera profesional en Boca — 15 años, debut en 1956, retiro en 1970, sin conocer otros colores',
      'Era el capitán y referente indiscutido de los equipos de la década del sesenta',
      'Su temperamento aguerrido y liderazgo lo convirtieron en un símbolo del espíritu xeneize',
      'Caudillo y gran capitán de los años 60 que jugó toda su carrera solo defendiendo esta camiseta',
      'En el Mundial de 1966, tras ser expulsado polémicamente, se sentó en la alfombra de la Reina Isabel y estrujó un banderín inglés',
      'En una final contra el Santos en 1963, le propuso a su entrenador darle un cachetazo a Pelé para que el árbitro los expulsara a ambos',
    ],
  },

  {
    id: 'rojas',
    nombre: 'Ángel Clemente',
    apellido: 'Rojas',
    apodo: 'Rojitas',
    posicion: 'Mediocampista ofensivo / Extremo',
    dorsal: '10',
    periodos: ['1963–1972'],
    titulos: [
      '5 títulos locales',
      'Estatua propia en el Museo de la Pasión Boquense',
    ],
    descripcion:
      'Elegante y técnico extremo de los años 60. Tiene estatua propia en el Museo de la Pasión Boquense. En un amistoso de 1963 le hizo un doblete al Real Madrid. Su gambeta era inigualable.',
    dificultad: 'dificil',
    era: '1960s-1970s',
    imageUrl: null,
    pistas: [
      'Su apodo es un diminutivo cariñoso de su apellido',
      'Era un jugador elegante y técnico, con habilidad para desequilibrar y asistir',
      'Nació en Sarandí, un municipio del conurbano bonaerense',
      'Gran ídolo de la delantera en los años 60, deslumbraba a todos por su famoso quiebre de cintura y su espectacular gambeta',
      'En un amistoso de 1963 le hizo un doblete al Real Madrid y su talento fue tan admirado que fue comparado con el propio Pelé',
      'Fue tan inmensamente querido e importante para la historia del club que posee una estatua propia en el Museo de la Pasión Boquense',
    ],
  },

  {
    id: 'palacio',
    nombre: 'Rodrigo',
    apellido: 'Palacio',
    apodo: 'El Trenza',
    posicion: 'Delantero / Extremo',
    dorsal: '11',
    periodos: ['2005–2009'],
    titulos: [
      'Copa Sudamericana 2005',
      'Recopa Sudamericana 2006 y 2008',
    ],
    descripcion:
      'Patagónico de Rawson, Chubut. Factor clave en el equipo del 2005. Brilló en Europa con Inter de Milán y Bologna. Su trenza era tan icónica como su juego. Finalista del Mundial 2014.',
    dificultad: 'dificil',
    era: '2000s',
    imageUrl: null,
    pistas: [
      'Nació en Rawson, la capital de Chubut, en la Patagonia argentina',
      'Luego de Boca tuvo una larga carrera en Europa: Atlético de Madrid, Inter de Milán, Bologna',
      'Jugó la final con la Selección Argentina en el Mundial de Brasil 2014',
      'Ágil y rapidísimo atacante que fue el socio perfecto en la delantera de uno de los mejores equipos de la década del 2000',
      'Resultó ser un factor desequilibrante en el equipo que conquistó la liga local, la Recopa y la Copa Sudamericana durante la temporada 2005',
      'Más allá de su velocidad asombrosa, era fácilmente reconocible dentro de la cancha porque llevaba un particular y fino mechón de cabello largo',
    ],
  },

  {
    id: 'marzolini',
    nombre: 'Silvio',
    apellido: 'Marzolini',
    apodo: 'El Maestro',
    posicion: 'Lateral izquierdo / Director Técnico',
    dorsal: '3',
    periodos: ['1960–1972'],
    titulos: [
      'Títulos de liga 1962, 1964, 1965',
      'Torneos Nacionales 1969 y 1970',
      '408 partidos — tercer récord histórico del club',
    ],
    descripcion:
      'Tercer jugador con más presencias en la historia del club (408 partidos). Considerado uno de los mejores laterales izquierdos de la historia del club. DT del equipo campeón del Metropolitano 1981 con Maradona.',
    dificultad: 'dificil',
    era: '1960s',
    imageUrl: null,
    pistas: [
      'Considerado quizás el mejor lateral izquierdo en la historia de Boca Juniors',
      'Fue pilar en los títulos de 1962, 1964 y 1965 — era dorada de los sesenta',
      'Nació en 1940 y defendió la camiseta azul y oro durante más de una década',
      'Defensor histórico que ocupa el tercer lugar en la tabla de presencias absolutas con 408 partidos disputados',
      'Años después de colgar los botines, asumió como director técnico y logró consagrar campeón al equipo que contaba con Diego Maradona en 1981',
      'Su estilo refinado y su gran jerarquía lo mantienen vigente como uno de los laterales por izquierda más talentosos y recordados',
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
    periodos: ['1931–1939'],
    titulos: [
      'Primer campeonato profesional 1931',
      '3 títulos de liga (1930s)',
      'Finalista del primer Mundial de la historia (Uruguay 1930)',
    ],
    descripcion:
      'Tercer máximo goleador histórico con 194 goles. Jugó la final del primer Mundial (Uruguay 1930). Empató de penal el primer Superclásico profesional en 1931. Vivió más de 100 años.',
    dificultad: 'muy_dificil',
    era: '1930s',
    imageUrl: null,
    pistas: [
      'Sus goles en la década del treinta eran celebrados con remates de enorme potencia',
      'Su apodo hace referencia al tamaño pequeño pero explosivo de su disparo',
      'Vivió más de 100 años y fue el último sobreviviente del primer Mundial de la historia',
      'Ídolo fundamental del inicio del profesionalismo, anotó 194 goles siendo el tercer máximo artillero histórico de la institución',
      'Empató de penal el primer Superclásico de la era profesional en 1931, el cual provocó tanta polémica que el árbitro terminó expulsando a tres rivales',
      'Lideró la ofensiva en el primer campeonato logrado por el club durante la naciente era profesional del fútbol argentino en 1931',
    ],
  },

  {
    id: 'cherro',
    nombre: 'Roberto',
    apellido: 'Cherro',
    apodo: 'El Torito',
    posicion: 'Delantero',
    dorsal: '?',
    periodos: ['1926–1938'],
    titulos: [
      '2° máximo goleador histórico del club (218 goles)',
      'Medalla de plata Juegos Olímpicos 1928 con Argentina',
      'Múltiples títulos en la era amateur e inicios del profesionalismo',
    ],
    descripcion:
      'Segundo máximo goleador histórico del club con 218 goles. Fue el récord hasta que Palermo lo superó. Ganó medalla de plata en los Juegos Olímpicos 1928 con la Selección Argentina.',
    dificultad: 'muy_dificil',
    era: '1930s',
    imageUrl: null,
    pistas: [
      'Jugó en la década del veinte y del treinta — los inicios del profesionalismo argentino',
      'Formó una tripleta goleadora temible junto a Varallo y Benítez Cáceres',
      'Su apodo alude al carácter bravo y potente de su juego',
      'Anotó 218 goles y fue el máximo goleador histórico del club durante más de setenta años hasta que fue superado',
      'Su verdadero apellido no llevaba la letra hache, pero por su origen italiano sonaba distinto y la gente lo popularizó así',
      'Además de su enorme capacidad goleadora, especialmente de cabeza, ganó la medalla de plata con la Selección Argentina en los Juegos Olímpicos de 1928',
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
      'Récord histórico: 10 goles ante River Plate',
    ],
    descripcion:
      'Delantero brasileño con el récord histórico de más goles ante River Plate: 10 en Superclásicos. Ídolo extranjero muy amado en los años 60. Jugó en el Boca de los primeros títulos de la era moderna.',
    dificultad: 'muy_dificil',
    era: '1960s',
    imageUrl: null,
    pistas: [
      'Es brasileño, nacido en la ciudad de Río de Janeiro',
      'Es uno de los extranjeros más queridos en la historia del club',
      'Su apellido es también un nombre propio muy común en el mundo hispano',
      'Tiene el récord de más goles convertidos ante River Plate por un solo jugador: 10 en Superclásicos',
      'Por esa razón su apodo implica que castigó duramente al eterno rival',
      'Jugó en Boca entre 1958 y 1964, en la era de los títulos de los primeros sesenta',
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
      'Su apellido compuesto tiene dos partes — la primera es también una palabra del mar',
      'Jugó en la era amateur y los comienzos del profesionalismo argentino',
      'Es una de las figuras más desconocidas entre los grandes goleadores históricos del Xeneize',
    ],
  },

  {
    id: 'roma',
    nombre: 'Antonio',
    apellido: 'Roma',
    apodo: 'El Indio',
    posicion: 'Arquero',
    dorsal: '1',
    periodos: ['1960–1972'],
    titulos: [
      'Títulos de liga 1962, 1964, 1965',
      'Torneos Nacionales 1969 y 1970',
    ],
    descripcion:
      'Arquero mítico de los años 60. Defendió el arco en más de 300 partidos. Su atajada del penal ante River en el Superclásico de 1962 es una de las más recordadas de la historia del club.',
    dificultad: 'muy_dificil',
    era: '1960s',
    imageUrl: null,
    pistas: [
      'Fue el arquero titular de los equipos campeones de los años sesenta junto a Rattín y Rojas',
      'Defendió el arco del club durante más de una década, disputando más de 300 partidos',
      'Su apellido es el nombre de una de las ciudades más famosas del mundo',
      'Mítico portero de los años 60 que fue fundamental por atajar un histórico penal en el año 1962 que valió un campeonato',
      'La contención de aquel penal en 1962 cobró mayor leyenda porque el ejecutante reclamó un claro adelantamiento, pero el árbitro lo ignoró',
      'Defendió la valla del equipo en más de 300 partidos, consolidándose como uno de los porteros más seguros de toda esa época',
    ],
  },

  {
    id: 'lorenzo',
    nombre: 'Juan Carlos',
    apellido: 'Lorenzo',
    apodo: 'Toto',
    posicion: 'Director Técnico',
    dorsal: '-',
    periodos: ['1976–1979', '1987'],
    titulos: [
      '2 Copas Libertadores (1977 y 1978)',
      '1 Copa Intercontinental 1977 (3-0 vs Borussia Mönchengladbach)',
    ],
    descripcion:
      'El DT de las primeras dos Copas Libertadores. Ganó la Copa Intercontinental 1977 por 3-0 en Alemania con una formación completamente ofensiva. Su valentía táctica sorprendió al mundo.',
    dificultad: 'muy_dificil',
    era: '1970s',
    imageUrl: null,
    pistas: [
      'Fue el entrenador que condujo al club a ganar sus primeros títulos internacionales en los años 70',
      'Su equipo ganó dos veces el mismo torneo internacional de forma consecutiva',
      'Es considerado uno de los estrategas más importantes en la historia xeneize',
      'Experimentado estratega que llevó a la institución a conquistar sus primeras dos Copas Libertadores de manera consecutiva en los años 70',
      'Fue el gestor táctico del primer campeonato intercontinental, logrando un contundente triunfo por 3 a 0 en Alemania',
      'Apostó a una formación completamente ofensiva con tres delanteros en esa histórica final intercontinental, lo que sorprendió totalmente al rival europeo',
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
      'Participó en la histórica Copa Libertadores 1963 donde Boca llegó a una final memorable',
    ],
  },

  {
    id: 'pescia',
    nombre: 'Natalio',
    apellido: 'Pescia',
    apodo: 'Pescia',
    posicion: 'Mediocampista',
    dorsal: '?',
    periodos: ['1942–1956'],
    titulos: [
      'Varios títulos de liga en los años 40 y 50',
      'Top 10 de presencias históricas (365 partidos)',
    ],
    descripcion:
      'Mediocampista histórico que jugó toda su carrera únicamente en Boca (365 partidos). La segunda bandeja de la popular local del estadio lleva su nombre como homenaje eterno.',
    dificultad: 'muy_dificil',
    era: '1940s-1950s',
    imageUrl: null,
    pistas: [
      'Fue mediocampista de Boca en los años cuarenta y cincuenta, una era poco conocida del club',
      'Era muy querido por la hinchada, que lo consideraba un símbolo de entrega y lealtad',
      'Jugó toda su carrera profesional únicamente en este club, sin conocer otros colores',
      'Mediocampista histórico que ostenta el raro mérito de haber jugado la totalidad de su carrera profesional únicamente en este club',
      'Con 365 encuentros disputados, tiene asegurado un lugar dentro de los diez jugadores con mayores presencias en la historia',
      'Su huella como jugador fue tan imborrable y querida que la segunda bandeja de la popular local del estadio fue bautizada con su nombre',
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
      'Delantero explosivo de la era del 40, conocido por enfrentar y vencer a "La Máquina" de River. Ganó 6 títulos entre 1934 y 1944. Una leyenda casi olvidada del fútbol argentino.',
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
