export const LockedState = () => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
    <div className="relative mb-6">
      <div
        className="w-20 h-20 rounded-full border-2 border-boca-gold/30 flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle, rgba(0,52,126,0.6) 0%, rgba(0,21,41,0.9) 100%)',
        }}
      >
        <svg
          viewBox="0 0 40 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-12 opacity-80"
        >
          <path
            d="M20 2 L38 10 L38 30 C38 40 20 46 20 46 C20 46 2 40 2 30 L2 10 Z"
            fill="none"
            stroke="#FFD700"
            strokeWidth="1.5"
          />
          <rect x="9" y="18" width="22" height="5" rx="0.5" fill="#FFD700" opacity="0.9" />
          <rect x="9" y="25" width="22" height="5" rx="0.5" fill="#FFD700" opacity="0.9" />
        </svg>
      </div>
    </div>

    <h2 className="type-section-title text-white mb-2 font-serif italic">Registrá tu historial</h2>
    <p className="type-body text-text-muted max-w-xs leading-relaxed mb-5">
      Llevá la cuenta de todos los partidos de Boca a los que fuiste en persona.
    </p>

    <div className="inline-flex items-center gap-2 border border-boca-gold/30 bg-boca-blue-light rounded-sm px-4 py-2.5">
      <p className="type-caption text-text-muted">
        Iniciá sesión desde el botón en la barra de navegación
      </p>
    </div>
  </div>
);
