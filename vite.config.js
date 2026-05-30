import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration for the FitFuel React app.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    open: true,
  },
})
