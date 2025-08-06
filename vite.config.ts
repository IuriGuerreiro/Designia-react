import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Permissions-Policy': 'identity-credentials-get=*, publickey-credentials-get=*, storage-access=*',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    },
    proxy: {
      '/api': {
        target: 'http://192.168.3.2:8001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
