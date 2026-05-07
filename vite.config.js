import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const ASSETS_DIR = 'themes/bluuu/assets/home'
const PAGE_FILE  = 'themes/bluuu/pages/home.htm'

const CMS_HEADER = `url = "/:slug?/:slug1?"
title = "New"
is_hidden = 0
==
<?php

?>
==
`

function updatePagePlugin() {
  return {
    name: 'update-page',
    closeBundle() {
      const indexPath = path.resolve(ASSETS_DIR, 'index.html')
      if (!fs.existsSync(indexPath)) return

      const built = fs.readFileSync(indexPath, 'utf-8')
      fs.writeFileSync(path.resolve(PAGE_FILE), CMS_HEADER + built)
      fs.unlinkSync(indexPath)
      console.log('[update-page] Updated', PAGE_FILE)
    },
  }
}

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/themes/bluuu/assets/home/' : '/',
  plugins: [
    react(),
    updatePagePlugin(),
    {
      name: 'spa-fallback',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url?.startsWith('/explore') || req.url?.startsWith('/discover')) {
            req.url = '/index.html';
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://bluuu.tours',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: ASSETS_DIR,
    emptyOutDir: true,
    assetsDir: '',
    modulePreload: {
      resolveDependencies: (_filename, deps) =>
        deps.filter(d => !d.includes('vendor-datepicker') && !d.includes('fancybox')),
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':      ['react', 'react-dom'],
          'vendor-datepicker': ['react-datepicker'],
          'vendor-icons':      ['lucide-react'],
          'vendor-phone':      ['react-international-phone'],
          'vendor-motion':     ['framer-motion'],
          'vendor-hugeicons':  ['@hugeicons/react', '@hugeicons/core-free-icons'],
        },
      },
    },
  },
}))
