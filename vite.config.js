import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/themes/bluuu/assets/old/' : '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://bluuu.tours',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    assetsDir: '',
  },
}))
