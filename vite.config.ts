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
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; La12Digital/1.0)' },
      },
    },
  },
})
