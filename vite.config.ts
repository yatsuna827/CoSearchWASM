/// <reference types="vitest" />
import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'
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
  plugins: [reactRouter(), tsconfigPaths()],
  test: {
    globals: true,
    watch: false,
    includeSource: ['app/**/*.{js,ts}'],
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
})
