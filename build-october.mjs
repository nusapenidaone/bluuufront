/**
 * build-october.mjs
 *
 * SSR pre-renders explore and discover pages and writes them into the October CMS theme.
 * Home is handled by updatePagePlugin() inside vite.config.js during `npm run build:home`.
 *
 * Run after `npm run build:all`:
 *   node build-october.mjs
 *
 * Or use the combined script:
 *   npm run build:october
 */

import { readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

// ── Paths ─────────────────────────────────────────────────────────────────────
const OCTOBER_THEME = resolve('themes/bluuu');
const PAGES_DIR     = `${OCTOBER_THEME}/pages`;
const ASSETS_DIR    = `${OCTOBER_THEME}/assets`;

// ── October CMS page config per site ─────────────────────────────────────────
const SITE_CONFIG = {
  explore: {
    url:   '/explore',
    title: 'Explore Tours — Nusa Penida | Bluuu',
  },
  discover: {
    url:   '/discover',
    title: 'Discover Nusa Penida | Bluuu',
  },
};


// ── Mock browser globals so React doesn't crash in Node ───────────────────────
const noop = () => {};
const noopEl = () => ({
  style: {}, type: '', src: '', async: false, crossOrigin: '',
  appendChild: noop, setAttribute: noop, getAttribute: () => null,
  parentNode: { insertBefore: noop },
});

globalThis.window = {
  location: { hostname: 'bluuu.tours', search: '', pathname: '/', href: 'https://bluuu.tours/' },
  scrollY: 0, innerWidth: 1280, innerHeight: 800,
  addEventListener: noop, removeEventListener: noop,
  TiktokAnalyticsObject: undefined,
};
globalThis.document = {
  referrer: '',
  querySelector: () => null,
  querySelectorAll: () => ({ forEach: noop, length: 0 }),
  createElement: noopEl,
  head: { appendChild: noop },
  body: { appendChild: noop },
  getElementById: () => null,
  getElementsByTagName: () => [noopEl()],
};
globalThis.sessionStorage = { getItem: () => null, setItem: noop };
Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'node' }, writable: true, configurable: true });
globalThis.IntersectionObserver = class { observe() {} disconnect() {} unobserve() {} };
globalThis.MutationObserver     = class { observe() {} disconnect() {} };
globalThis.ResizeObserver       = class { observe() {} disconnect() {} unobserve() {} };
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
globalThis.cancelAnimationFrame  = noop;
// ──────────────────────────────────────────────────────────────────────────────

async function run() {
  if (!existsSync(PAGES_DIR)) mkdirSync(PAGES_DIR, { recursive: true });

  const server = await createServer({
    plugins: [react()],
    server: { middlewareMode: true },
    appType: 'custom',
  });

  try {
    const { renderToString } = await import('react-dom/server');
    const { createElement, StrictMode } = await import('react');

    for (const site of ['explore', 'discover']) {
      const cfg = SITE_CONFIG[site];
      console.log(`\n▶ ${site}`);

      globalThis.window.location.pathname = cfg.url;
      globalThis.window.location.href     = `https://bluuu.tours${cfg.url}`;

      server.moduleGraph.invalidateAll();

      const { default: App } = await server.ssrLoadModule(`/src/App.${site}.jsx`);
      const appHtml = renderToString(createElement(StrictMode, null, createElement(App)));
      console.log(`  ✓ SSR rendered`);

      // Assets were built directly into themes/bluuu/assets/${site}/
      const assetsPath = `${ASSETS_DIR}/${site}`;
      const indexHtmlPath = `${assetsPath}/index.html`;

      if (!existsSync(indexHtmlPath)) {
        console.error(`  ✗ ${indexHtmlPath} not found — run npm run build:${site} first`);
        continue;
      }

      const template = readFileSync(indexHtmlPath, 'utf-8');

      const fullHtml = template
        .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

      const pageContent = `url = "${cfg.url}"
title = "${cfg.title}"
is_hidden = 0
==
<?php
function onStart() {
    return Response::make($this->renderPage(), 200);
}
?>
==
${fullHtml}`;

      const pagePath = `${PAGES_DIR}/${site}.htm`;
      writeFileSync(pagePath, pageContent, 'utf-8');
      console.log(`  ✓ ${pagePath}`);

      // Remove index.html — it's now embedded in the .htm page
      unlinkSync(indexHtmlPath);
      console.log(`  ✓ Removed ${indexHtmlPath}`);
    }
  } finally {
    await server.close();
  }

  console.log('\n✅ October CMS theme updated.');
}

run().catch(err => { console.error(err); process.exit(1); });
