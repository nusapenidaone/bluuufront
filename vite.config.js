import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const ASSETS_DIR = 'themes/bluuu/assets/home'
const PAGE_FILE = 'themes/bluuu/pages/new.htm'

const CMS_HEADER = `url = "/new/:slug?/:slug1?"
title = "New"
is_hidden = 0
==
<?php
use Noren\\Bluuu\\Models\\Blog;
function onStart(){
   // return Blog::with('images')->get();
}
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
      const pagePath = path.resolve(PAGE_FILE)

      fs.writeFileSync(pagePath, CMS_HEADER + built)
      fs.unlinkSync(indexPath)
      console.log('[update-page] Updated', PAGE_FILE)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/themes/bluuu/assets/home/' : '/',
  plugins: [react(), updatePagePlugin()],
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
    outDir: ASSETS_DIR,
    emptyOutDir: true,
    assetsDir: '',
  },
}))
