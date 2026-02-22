import { Badge } from '../Badge';

// TODO: conectar con API de clima para temperatura/condición real.
// La imagen del estadio y el countdown se reemplazarán con datos dinámicos.
const STADIUM_IMG =
  'https://www.figma.com/api/mcp/asset/51c4ad7b-4b7d-48bd-adfc-7cb4a8ef2bd5';

interface MockWeather {
  temp: number;
  description: string;
  icon: string;
  diasHastaPartido: number;
}

const MOCK: MockWeather = {
  temp: 24,
  description: 'Despejado',
  icon: '☀️',
  diasHastaPartido: 5,
};

export function BomboneraWidget() {
  const { temp, description, icon, diasHastaPartido } = MOCK;

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
            <Badge variant="blue">{temp}°C · {icon} {description}</Badge>
          </div>
          <Badge variant="gold" className="w-fit">
            Próximo partido de local: {diasHastaPartido} días
          </Badge>
        </div>
      </div>
    </section>
  );
}
