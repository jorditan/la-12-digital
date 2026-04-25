import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { BannerMensaje } from './components/BannerMensaje';
import { UltimosPartidos } from './components/UltimosPartidos';
import { BomboneraWidget } from './components/BomboneraWidget';
import { ProximosPartidos } from './components/ProximosPartidos';
import { Noticias } from './components/Noticias';
import { CanalYoutube } from './components/CanalYoutube';
import { IdolosGame } from './components/IdolosGame';
import { EquiposGame } from './components/EquiposGame';
import { Sidebar } from './components/layout/Sidebar';
import { TablaPosiciones } from './components/TablaPosiciones';
import { MiHistorial } from './components/MiHistorial';
import { Configuracion } from './components/Configuracion';
import { AuthModal } from './components/Auth';
import { useAuth } from './hooks/useAuth';
import { Toaster } from 'sonner';

function DashboardPage() {
  return (
    <>
      <div className="flex">
        {/* Contenido principal */}
        <main
          id="main-content"
          className="flex-1 min-w-0 px-3 py-3 sm:px-6 sm:py-8 lg:px-10 flex flex-col gap-4 sm:gap-8"
        >
          <ProximosPartidos />
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-8 sm:items-stretch">
            <div className="min-w-0 sm:flex-1 flex flex-col">
              <BomboneraWidget />
            </div>
            <div className="min-w-0 sm:flex-1 flex flex-col">
              <UltimosPartidos />
            </div>
          </div>
          <Noticias />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <IdolosGame />
            <EquiposGame />
          </div>
          <CanalYoutube />
        </main>

        {/* Tabla Posiciones — sticky dentro del mismo contenedor que main */}
        <aside className="hidden lg:block w-[21rem] xl:w-[24rem] shrink-0 border-l border-boca-border">
          <div className="sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto flex flex-col p-4 sm:p-6">
            <TablaPosiciones />
          </div>
        </aside>
      </div>

      {/* Mobile: botón flotante + drawer para la tabla */}
      <Sidebar />
    </>
  );
}

function AppInner() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const {
    user,
    login,
    register,
    logout,
    uploadAvatar,
    updateEmail,
    updatePassword,
    updateDisplayName,
    updateBio,
  } = useAuth();

  useEffect(() => {
    if (user) {
      setShowLoginModal(false);
    }
  }, [user]);

  return (
    <div className="min-h-dvh text-white font-serif relative overflow-x-clip bg-app-bg">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:bg-boca-gold focus:text-boca-blue focus:px-4 focus:py-2 focus:rounded-sm focus:font-semibold focus:font-sans"
      >
        Saltar al contenido
      </a>
      <Header
        user={user}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={logout}
        onUploadAvatar={uploadAvatar}
      />
      <BannerMensaje />

      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/plantel" element={<DashboardPage />} />
        <Route path="/mi-historial" element={<MiHistorial user={user} />} />
        <Route
          path="/configuracion"
          element={
            <Configuracion
              user={user}
              onUploadAvatar={uploadAvatar}
              onUpdateEmail={updateEmail}
              onUpdatePassword={updatePassword}
              onUpdateDisplayName={updateDisplayName}
              onUpdateBio={updateBio}
            />
          }
        />
        <Route path="*" element={<DashboardPage />} />
      </Routes>

      {showLoginModal && (
        <AuthModal onLogin={login} onRegister={register} onClose={() => setShowLoginModal(false)} />
      )}

      <footer
        aria-label="Pie de página"
        className="border-t border-boca-border px-4 py-6 sm:px-10 text-center"
      >
        <p className="font-sans text-xs text-text-muted">
          Esta plataforma busca recopilar y centraliza información del{' '}
          <a
            href="https://www.bocajuniors.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-boca-gold/70 hover:text-boca-gold transition-colors"
          >
            Club Atlético Boca Juniors
          </a>
          . Hecha con amor bostero y sin fines de lucro.
        </p>
      </footer>
    </div>
  );
}

function AppToaster() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        style: {
          background: 'var(--color-boca-gold)',
          border: '1px solid var(--color-boca-gold-dark)',
          color: 'var(--color-boca-blue)',
          fontFamily: 'Geist, sans-serif',
          fontSize: '14px',
          fontWeight: '600',
        },
      }}
    />
  );
}

export default function AppWithToaster() {
  return (
    <>
      <AppInner />
      <AppToaster />
    </>
  );
}
