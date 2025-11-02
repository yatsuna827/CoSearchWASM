/// <reference types="vitest" />
import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  base: '/CoSearchWASM/',
  build: {
    assetsDir: 'modules',
  },
  worker: {
    format: 'es',
  },
  server: {
    open: true,
    port: 8080,
  },
  plugins: [
    reactRouter(),
    tsconfigPaths(),
    VitePWA({
      srcDir: 'app/service-worker',
      filename: 'sw.ts',
      strategies: 'injectManifest',
      injectRegister: false,
      manifest: false,
      injectManifest: {
        injectionPoint: undefined,
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  test: {
    globals: true,
    watch: false,
    includeSource: ['app/**/*.{js,ts}'],
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
  resolve: {
    alias: {
      '@': '/app',
    },
  },
})
