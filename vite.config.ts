import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // Listen on all network interfaces for IP access and Docker
    port: 5174,
    strictPort: false, // Allow Vite to try next port if 5173 is busy
    hmr: {
      host: 'designia.testingthing.work', // Allow HMR from this domain
    },
    headers: {
      // Allow cross-origin communication for Google OAuth
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
  },
})
