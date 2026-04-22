import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@design-system": path.resolve(__dirname, "./design-system"),
      },
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        // In dev, proxy /api/livescore/* → livescore-api.com and inject credentials from .env
        "/api/livescore": {
          target: "https://livescore-api.com",
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq, req) => {
              const [pathname, search] = (req.url ?? "").split("?");
              const params = new URLSearchParams(search ?? "");
              params.set("key", env.VITE_LIVESCORE_KEY ?? "");
              params.set("secret", env.VITE_LIVESCORE_SECRET ?? "");
              proxyReq.path = `/api-client${pathname.replace(/^\/api\/livescore/, "")}?${params}`;
            });
          },
        },
        // Open-Meteo (weather) is called directly from the browser — no proxy needed.
      },
    },
    build: {
      // Target modern browsers — smaller, faster bundles
      target: "es2020",
      // El chunk principal de la app (código propio) supera 600kB sin lazy routes.
      // Para reducirlo habría que aplicar React.lazy() por ruta — queda como mejora futura.
      // Se sube el umbral para no generar ruido en el build ya que los vendors sí están separados.
      chunkSizeWarningLimit: 750,
      rollupOptions: {
        output: {
          // Manual code splitting: separar vendor chunks grandes para mejor cache
          // Los chunks de vendor se cachean en el navegador incluso cuando cambia la app
          manualChunks: {
            // React core — cambia raramente, cache-hit muy alto
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            // Supabase — librería grande, separada del bundle principal
            "vendor-supabase": ["@supabase/supabase-js"],
            // Utilidades UI pequeñas
            "vendor-ui": ["lucide-react", "sonner"],
          },
        },
      },
    },
  };
});
