// TODO: reemplazar con assets locales (src/assets/trofeos/) cuando expiren las URLs Figma

// ── Assets Figma (temporales ~7 días) ─────────────────────────────────────────
// Libertadores: máscara + imágenes internas (color/textura del trofeo)
const LIB_MASK  = 'https://www.figma.com/api/mcp/asset/1fdc3d9a-07a6-4cdc-8b1b-0937c4dddf77';
const LIB_IMG_1 = 'https://www.figma.com/api/mcp/asset/ec5533c7-4c3b-4b88-86f1-a97c31e54d49';
const LIB_IMG_N = 'https://www.figma.com/api/mcp/asset/6ad834b6-08d4-483f-8d5f-b6a31bdb4210';
// Intercontinental, Sudamericana, Recopa: flat gold con máscara propia
const INTER_MASK  = 'https://www.figma.com/api/mcp/asset/42649cbe-6e65-4188-a979-2bc358e7a80a';
const SUDA_MASK   = 'https://www.figma.com/api/mcp/asset/0158fc1f-103f-4549-a9b0-1eb977886b6d';
const RECOPA_MASK = 'https://www.figma.com/api/mcp/asset/3ad7c7da-27a1-4a1e-ad3a-013398c76760';

const GOLD = '#FFD700';

export type TrofeoType = 'Libertadores' | 'Intercontinental' | 'Sudamericana' | 'Recopa';

interface TrofeoIconProps {
  type?: TrofeoType;
  className?: string;
}

const ARIA_LABELS: Record<TrofeoType, string> = {
  Libertadores:     '6 Copas Libertadores',
  Intercontinental: '3 Copas Intercontinentales',
  Sudamericana:     '2 Copas Sudamericanas',
  Recopa:           '4 Recopas Sudamericanas',
};

export function TrofeoIcon({ type = 'Libertadores', className }: TrofeoIconProps) {
  return (
    <div
      role="img"
      aria-label={ARIA_LABELS[type]}
      className={`flex items-center gap-1 ${className ?? ''}`}
    >
      {type === 'Libertadores' && <LibertadoresIcons />}
      {type === 'Intercontinental' && <FlatGoldIcons count={3} maskUrl={INTER_MASK} maskSize="16px 17px" maskPos="0px -0.446px" w={16} h={16} />}
      {type === 'Sudamericana'    && <FlatGoldIcons count={2} maskUrl={SUDA_MASK}   maskSize="8px 15px"  maskPos="4px 0px"    w={16} h={15} />}
      {type === 'Recopa'          && <FlatGoldIcons count={4} maskUrl={RECOPA_MASK} maskSize="8px 15px"  maskPos="4px 0px"    w={16} h={15} />}
    </div>
  );
}

// ── Libertadores: 6 trofeos con imagen interna ────────────────────────────────

function LibertadoresIcons() {
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'relative',
            flexShrink: 0,
            width: '16.087px',
            height: '16.891px',
            WebkitMaskImage: `url('${LIB_MASK}')`,
            maskImage: `url('${LIB_MASK}')`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: '16px 16.891px',
            maskSize: '16px 16.891px',
            WebkitMaskPosition: '0px 0px',
            maskPosition: '0px 0px',
          }}
        >
          <img
            src={i === 0 ? LIB_IMG_1 : LIB_IMG_N}
            alt=""
            style={{
              position: 'absolute',
              display: 'block',
              width: '100%',
              height: '100%',
              maxWidth: 'none',
            }}
          />
        </div>
      ))}
    </>
  );
}

// ── Intercontinental / Sudamericana / Recopa: flat gold con máscara ───────────

interface FlatGoldProps {
  count: number;
  maskUrl: string;
  maskSize: string;
  maskPos: string;
  w: number;
  h: number;
}

function FlatGoldIcons({ count, maskUrl, maskSize, maskPos, w, h }: FlatGoldProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{
            flexShrink: 0,
            width: `${w}px`,
            height: `${h}px`,
            backgroundColor: GOLD,
            WebkitMaskImage: `url('${maskUrl}')`,
            maskImage: `url('${maskUrl}')`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: maskSize,
            maskSize: maskSize,
            WebkitMaskPosition: maskPos,
            maskPosition: maskPos,
          }}
        />
      ))}
    </>
  );
}
