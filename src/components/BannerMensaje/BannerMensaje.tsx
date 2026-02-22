import { TrofeoIcon, type TrofeoType } from '../TrofeoIcon';

// Orden de rotación: cambia cada día (día del año % 4)
const TIPOS_TROFEO: TrofeoType[] = ['Libertadores', 'Sudamericana', 'Recopa', 'Intercontinental'];

function getTrofeoDelDia(): TrofeoType {
  const now = new Date();
  // Día del año (0-364) para que rote diariamente y sea consistente en reloads
  const inicio = new Date(now.getFullYear(), 0, 0);
  const diaDelAnio = Math.floor((now.getTime() - inicio.getTime()) / 86_400_000);
  return TIPOS_TROFEO[diaDelAnio % TIPOS_TROFEO.length];
}

// Himno completo de Boca Juniors (Figma node 20:119 "Flowers Banner")
const BOCA_HYMN =
  'Boca Juniors, Boca Juniors gran campeón del balompié \u00b7 ' +
  'Que despierta en nuestros pechos Entusiasmo, amor y fe \u00b7 ' +
  'Tu bandera azul y oro En Europa, tremoló \u00b7 ' +
  'Como enseña vencedora \u00b7 ' +
  'Donde quiera que luchó Boca es nuestro grito de amor \u00b7 ' +
  'Boca nunca teme luchar \u00b7 ' +
  'Boca es entusiasmo y valor \u00b7 ' +
  '¡Boca Juniors a triunfar!';

// Mensajes por día (Sunday=0 … Saturday=6)
const MENSAJES_SEMANALES: Record<number, string> = {
  0: 'Domingo: día de comunión azul y oro',
  1: 'Comienza una nueva semana en La Ribera',
  2: 'La tradición se vive cada día del año',
  3: 'Mitad de semana, mitad + 1 siempre',
  4: 'Un día más cerca del domingo boquense',
  5: 'Se acerca el día del hincha xeneize',
  6: 'El día en que los hinchas peregrinan a La Bombonera',
};

export function BannerMensaje() {
  const mensajeHoy  = MENSAJES_SEMANALES[new Date().getDay()];
  const trofeoHoy   = getTrofeoDelDia();

  return (
    <section aria-label="Banner Boca Juniors">
      {/* ── Sección A: Ticker himno (fondo dorado) ── */}
      <div className="bg-boca-gold overflow-hidden p-[10px]">
        <div
          className="flex whitespace-nowrap"
          style={{ animation: 'marquee 35s linear infinite' }}
        >
          {/* Texto duplicado para loop continuo sin salto */}
          <span className="font-serif font-normal truncate text-base leading-6 text-[#0052a3] pr-16">
            {BOCA_HYMN}
          </span>
          <span
            className="font-serif font-normal text-base leading-6 text-[#0052a3] pr-16"
            aria-hidden="true"
          >
            {BOCA_HYMN}
          </span>
        </div>
      </div>

      {/* ── Sección B: Mensaje diario — izquierda + palmarés ── */}
      <div
        className="border-t border-b border-boca-gold/15 py-3 px-6 flex items-center gap-4 bg-boca-blue-light "
      >
        {/* Palmarés del día — rota diariamente (Figma node 61:901) */}
        <TrofeoIcon type={trofeoHoy} />

        {/* Divisor vertical sutil */}
        <span className="h-4 w-px bg-boca-gold/25 shrink-0" aria-hidden="true" />

        <p className="font-serif text-[16px] text-text-primary">
          {mensajeHoy}
        </p>
      </div>
    </section>
  );
}
