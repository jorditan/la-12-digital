import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { BannerMensaje } from './components/BannerMensaje';
import { UltimosPartidos } from './components/UltimosPartidos';
import { BomboneraWidget } from './components/BomboneraWidget';
import { ProximosPartidos } from './components/ProximosPartidos';
import { Noticias } from './components/Noticias';
import { CanalYoutube } from './components/CanalYoutube';
import { IdolosGame } from './components/IdolosGame';
import { EquiposGame } from './components/EquiposGame';
import { Sidebar } from './components/Sidebar';
import { MiHistorial } from './components/MiHistorial';
import { Configuracion } from './components/Configuracion';
import { AuthModal } from './components/Auth';
import { useAuth } from './hooks/useAuth';
import { Toaster } from 'sonner';

const STORAGE_KEY = 'sidebar-collapsed';


function DashboardPage({ sidebarCollapsed, onSidebarCollapsedChange }: { sidebarCollapsed: boolean; onSidebarCollapsedChange: (collapsed: boolean) => void }) {
  return (
    <>
      <Sidebar onCollapsedChange={onSidebarCollapsedChange} />
      <div
        className={[
          'w-full px-3 py-3 md:px-4 sm:px-6 sm:py-8 lg:px-10 transition-[margin] duration-300',
          sidebarCollapsed ? 'lg:mr-20 xl:mr-24' : 'lg:mr-[23rem] xl:mr-[27rem]',
        ].join(' ')}
      >
        <main className="w-full">
          <div className="flex flex-col gap-4 sm:gap-8">
            <ProximosPartidos />
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-8 sm:items-stretch">
              <div className="min-w-0 sm:flex-1 flex flex-col">
                <BomboneraWidget />
              </div>
              <div className="min-w-0 sm:flex-1 flex flex-col">
                <UltimosPartidos />
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-10">
            <Noticias />
          </div>
          <div className="mt-6 sm:mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <IdolosGame />
            <EquiposGame />
          </div>
          <div className="mt-6 sm:mt-10">
            <CanalYoutube />
          </div>
        </main>
      </div>
    </>
  );
}

function AppInner() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  );
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
    <div className="min-h-screen text-white font-serif relative overflow-x-hidden bg-app-bg">
      <Header user={user} onLoginClick={() => setShowLoginModal(true)} onLogout={logout} onUploadAvatar={uploadAvatar} />
      <BannerMensaje />

      <Routes>
        <Route
          path="/"
          element={<DashboardPage sidebarCollapsed={sidebarCollapsed} onSidebarCollapsedChange={setSidebarCollapsed} />}
        />
        <Route
          path="/plantel"
          element={<DashboardPage sidebarCollapsed={sidebarCollapsed} onSidebarCollapsedChange={setSidebarCollapsed} />}
        />
        <Route
          path="/mi-historial"
          element={<MiHistorial user={user} />}
        />
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
        <Route
          path="*"
          element={<DashboardPage sidebarCollapsed={sidebarCollapsed} onSidebarCollapsedChange={setSidebarCollapsed} />}
        />
      </Routes>

      {showLoginModal && (
        <AuthModal
          onLogin={login}
          onRegister={register}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
}

function AppToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: '#002140',
          border: '1px solid #00396e',
          color: '#e0e7ff',
          fontFamily: 'Geist, sans-serif',
          fontSize: '14px',
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
