import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      host: '0.0.0.0', // Listen on all network interfaces for IP access and Docker
      port: 5173,
      strictPort: false, // Allow Vite to try next port if 5173 is busy
      // Allow Cloudflare tunnel domain, testing domain wildcard, and Docker host from environment variables
      allowedHosts: [
        ...(env.VITE_CLOUDFLARE_TUNNEL_DOMAIN ? [env.VITE_CLOUDFLARE_TUNNEL_DOMAIN] : []),
        ...(env.VITE_TESTING_DOMAIN ? [env.VITE_TESTING_DOMAIN] : []),
        ...(env.VITE_DOCKER_HOST ? [env.VITE_DOCKER_HOST] : [])
      ],
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
  }
})
