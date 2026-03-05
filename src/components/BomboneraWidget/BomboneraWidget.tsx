import { Badge } from '../Badge';
import { useBomboneraWidget } from './hooks/useBomboneraWidget';

const STADIUM_IMG =
  'https://www.figma.com/api/mcp/asset/51c4ad7b-4b7d-48bd-adfc-7cb4a8ef2bd5';

export function BomboneraWidget() {
  const { weather, diasHastaPartido, loading } = useBomboneraWidget();

  return (
    <section
      aria-label="La bombonera en vivo"
      className="bg-[#031d46] border border-[#00396e] rounded-sm overflow-hidden flex flex-col h-full"
    >
      {/* Header */}
      <div className="border-b border-[#003d7a] px-6 pt-6 pb-3">
        <h2 className="type-section-title text-white">
          La bombonera en vivo
        </h2>
      </div>

      {/* Content */}
      <div className="px-6 pt-4 pb-6 flex flex-col gap-3 h-full">
        {/* Foto del estadio con borde dorado */}
        <div className="border border-boca-gold overflow-hidden">
          <img
            src={STADIUM_IMG}
            alt="Estadio Alberto J. Armando – La Bombonera"
            className="w-full object-cover block h-full"
            style={{ aspectRatio: '16/9' }}
          />
        </div>

        {/* Info del clima y partido */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="blue">📍 Brandsen 805</Badge>
            {loading ? (
              <Badge variant="blue" className="animate-pulse">— °C</Badge>
            ) : weather ? (
              <Badge variant="blue">
                {weather.temp}°C · {weather.emoji} {weather.description}
              </Badge>
            ) : null}
          </div>

          {!loading && diasHastaPartido !== null && (
            <Badge variant="gold" className="w-fit">
              {diasHastaPartido === 0
                ? '¡Partido de local hoy!'
                : `Próximo partido de local: ${diasHastaPartido} días`}
            </Badge>
          )}
        </div>
      </div>
    </section>
  );
}
