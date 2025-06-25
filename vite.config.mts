/// <reference types="vitest" />
import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/CoSearchWASM/',
  build: {
    assetsDir: 'modules',
  },
  worker: {
    format: 'es',
  },
  server: {
    // open: true,
    port: 8080,
  },
  plugins: [
    reactRouter(), 
    tsconfigPaths(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'app',
      filename: 'sw.ts',
      injectRegister: false,
      manifest: false,
      injectManifest: {
        injectionPoint: undefined
      },
      devOptions: {
        enabled: true,
        type: "module",
      }
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
})
