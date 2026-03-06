import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ["*", '5386-115-117-174-170.ngrok-free.app', '96e3-115-117-174-170.ngrok-free.app']
  }
})
