import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration for the FitFuel React app.
// In production we serve from the GitHub Pages project subpath (/fitfuel/),
// but keep the dev server at root (/) for a smooth local experience.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/fitfuel/' : '/',
  plugins: [react()],
  server: {
    port: 5174,
    open: true,
  },
}))
