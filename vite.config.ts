import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// Every page is its own HTML document, so each one is a build entry point.
const PAGES = [
  'index',
  'workspace',
  'daily-challenge',
  'playground',
  'playground/share',
  'leaderboard',
  'community',
  'community/new',
  'community/post',
  'profile',
  'profile/badges',
  'profile/edit',
  'streak',
];

export default defineConfig(() => {
  return {
    // Multi-page app: no SPA fallback, and clean URLs resolve to their .html file.
    appType: 'mpa' as const,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: Object.fromEntries(
          PAGES.map(page => [page, path.resolve(__dirname, `${page}.html`)])
        ),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
