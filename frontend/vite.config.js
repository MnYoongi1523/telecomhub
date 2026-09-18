import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Proxy hacia la API del monorepo: el frontend llama a /api/... en mismo
  // origen y Vite lo reenvía a Express (puerto 3001). Así el desarrollo es
  // 100% funcional con un solo origen y sin problemas de CORS.
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
