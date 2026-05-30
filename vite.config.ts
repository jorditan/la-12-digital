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
        // In dev, proxy /api/livescore/* → local scraper or Render backend
        "/api/livescore": {
          target: env.VITE_RENDER_BACKEND_URL || "http://localhost:3001",
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq, req) => {
              const [pathname, search] = (req.url ?? "").split("?");
              const params = new URLSearchParams(search ?? "");
              
              // Inject the local/Render API key
              const apiKey = env.VITE_RENDER_API_KEY ?? "tu-token-secreto-inventado-por-ti-ej-boca1234";
              proxyReq.setHeader("Authorization", `Bearer ${apiKey}`);
              
              // Rewrite path from /api/livescore/X to /api/X
              const cleanPath = pathname.replace(/^\/api\/livescore/, "/api");
              proxyReq.path = `${cleanPath}?${params}`;
            });
          },
        },
        "/api/youtube": {
          target: "https://www.googleapis.com",
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq, req) => {
              const [pathname, search] = (req.url ?? "").split("?");
              const params = new URLSearchParams(search ?? "");
              params.set("key", env.VITE_YOUTUBE_KEY ?? "");
              
              // Seteamos un Referer que Google no bloquee (o lo vaciamos)
              proxyReq.setHeader('Referer', 'https://www.googleapis.com/');
              
              const apiPath = pathname.replace(/^\/api\/youtube/, "/youtube/v3");
              proxyReq.path = `${apiPath}?${params}`;
            });
          },
        },
        // /api/boca-news → proxied to the production Cloudflare Worker in dev
        "/api/boca-news": {
          target: "https://la-12-digital.matiasowjordan.workers.dev",
          changeOrigin: true,
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
