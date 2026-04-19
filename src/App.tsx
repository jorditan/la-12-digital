import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { BannerMensaje } from "./components/BannerMensaje";
import { UltimosPartidos } from "./components/UltimosPartidos";
import { BomboneraWidget } from "./components/BomboneraWidget";
import { ProximosPartidos } from "./components/ProximosPartidos";
import { Noticias } from "./components/Noticias";
import { CanalYoutube } from "./components/CanalYoutube";
import { IdolosGame } from "./components/IdolosGame";
import { EquiposGame } from "./components/EquiposGame";
import { Sidebar } from "./components/layout/Sidebar";
import { TablaPosiciones } from "./components/TablaPosiciones";
import { MiHistorial } from "./components/MiHistorial";
import { Configuracion } from "./components/Configuracion";
import { AuthModal } from "./components/Auth";
import { useAuth } from "./hooks/useAuth";
import { Toaster } from "sonner";

function DashboardPage() {
  return (
    <>
      <div className="flex">
        {/* Contenido principal */}
        <main className="flex-1 min-w-0 px-3 py-3 sm:px-6 sm:py-8 lg:px-10 flex flex-col gap-4 sm:gap-8">
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
    <div className="min-h-screen text-white font-serif relative overflow-x-clip bg-app-bg">
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
          background: "#002140",
          border: "1px solid #00396e",
          color: "#e0e7ff",
          fontFamily: "Geist, sans-serif",
          fontSize: "14px",
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
