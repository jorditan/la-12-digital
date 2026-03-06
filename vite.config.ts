import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@design-system': path.resolve(__dirname, './design-system'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/sofascore': {
        target: 'https://api.sofascore.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sofascore/, '/api/v1'),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': 'https://www.sofascore.com/',
          'Origin': 'https://www.sofascore.com',
          'Accept-Language': 'es-AR,es;q=0.9,en-US;q=0.8,en;q=0.7',
        },
      },
    },
  },
})
