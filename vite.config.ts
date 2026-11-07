import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

// BASE_PATH lets the same build serve from a sub-path (GitHub Pages:
// /capivara-rica/) or from the root of a custom domain (Cloudflare Pages: /).
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Capivara Rica',
        short_name: 'Capivara Rica',
        description:
          'Uma vida inteira em 15 minutos: juros compostos, cartão, parcelamento e carreira.',
        lang: 'pt-BR',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#f6f1e7',
        theme_color: '#2f6f4e',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        // Everything is static; cache it all so the game works offline.
        globPatterns: ['**/*.{js,css,html,svg,png,json,woff2}'],
      },
    }),
  ],
  resolve: {
    alias: {
      $engine: fileURLToPath(new URL('./src/engine', import.meta.url)),
      $ui: fileURLToPath(new URL('./src/ui', import.meta.url)),
      $lib: fileURLToPath(new URL('./src/lib', import.meta.url)),
      $data: fileURLToPath(new URL('./data', import.meta.url)),
      $content: fileURLToPath(new URL('./content', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
