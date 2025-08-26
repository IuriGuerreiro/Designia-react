import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://connect-js.stripe.com https://accounts.google.com https://apis.google.com; script-src-elem 'self' 'unsafe-inline' https://js.stripe.com https://connect-js.stripe.com https://accounts.google.com https://apis.google.com; connect-src 'self' https://api.stripe.com https://connect-js.stripe.com https://accounts.google.com http://192.168.3.2:8001 http://localhost:8001 ws://192.168.3.2:8001 ws://localhost:8001; frame-src 'self' https://js.stripe.com https://connect-js.stripe.com https://hooks.stripe.com https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:;",
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
