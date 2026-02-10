import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Para que escuche en tu red local
    allowedHosts: [
      'photos-two-recreational-currency.trycloudflare.com', // La URL que te dio Cloudflare
      '.trycloudflare.com' // Opcional: Esto permite cualquier subdominio de trycloudflare
    ]
  }
})
