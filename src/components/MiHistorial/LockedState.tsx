export const LockedState = () => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
    <div className="relative mb-6">
      <div
        className="w-20 h-20 rounded-full border-2 border-boca-gold/30 flex items-center justify-center"
        style={{ background: 'radial-gradient(circle, rgba(0,52,126,0.6) 0%, rgba(0,21,41,0.9) 100%)' }}
      >
        <svg viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-12 opacity-80">
          <path d="M20 2 L38 10 L38 30 C38 40 20 46 20 46 C20 46 2 40 2 30 L2 10 Z" fill="none" stroke="#FFD700" strokeWidth="1.5" />
          <rect x="9" y="18" width="22" height="5" rx="0.5" fill="#FFD700" opacity="0.9" />
          <rect x="9" y="25" width="22" height="5" rx="0.5" fill="#FFD700" opacity="0.9" />
        </svg>
      </div>
      <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-boca-blue-light border border-boca-border rounded-full flex items-center justify-center">
        <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-text-muted">
          <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M5 7V5.5a3 3 0 0 1 6 0V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
    </div>

    <h2 className="type-section-title text-white mb-2 font-serif italic">Registrá tu historial</h2>
    <p className="type-body text-text-muted max-w-xs leading-relaxed mb-5">
      Llevá la cuenta de todos los partidos de Boca a los que fuiste en persona. Tu historial, para siempre.
    </p>

    <div className="inline-flex items-center gap-2 border border-boca-gold/30 bg-boca-blue-light rounded-sm px-4 py-2.5">
      <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-boca-gold shrink-0">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
        <path d="M8 5v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <p className="type-caption text-text-muted">
        Iniciá sesión desde el botón en la barra de navegación
      </p>
    </div>

    <div className="flex gap-2 mt-10 opacity-30">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full bg-boca-gold" style={{ opacity: 0.3 + i * 0.15 }} />
      ))}
    </div>
  </div>
);
