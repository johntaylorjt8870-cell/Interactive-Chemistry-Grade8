import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

/**
 * Production hosting: GitHub Pages, project site.
 * https://johntaylorjt8870-cell.github.io/Interactive-Physics-Chemistry-Grade8/
 *
 * The published site is served from a repository sub-path, so every emitted
 * asset URL must carry that prefix. The dev server keeps `/` so local
 * development and the Arena live preview work identically.
 */
export const PAGES_BASE_PATH = '/Interactive-Physics-Chemistry-Grade8/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? (process.env.VITE_BASE_PATH ?? PAGES_BASE_PATH) : '/',
  plugins: [react()],
  server: {
    // Development and preview servers are bound to all interfaces and accept
    // proxied preview hosts; production hosting is GitHub Pages and never
    // reaches this configuration.
    host: true,
    port: 5173,
    allowedHosts: true,
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2021',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        // KaTeX is only pulled in by scientific formulas, keep it in its own
        // chunk so the course home and subject pages stay light.
        manualChunks(id) {
          if (id.includes('node_modules/katex')) return 'katex'
          if (id.includes('node_modules/react-router')) return 'router'
          return undefined
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    css: false,
    restoreMocks: true,
  },
}))
