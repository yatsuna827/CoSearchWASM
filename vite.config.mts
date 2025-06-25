/// <reference types="vitest" />
import { reactRouter } from '@react-router/dev/vite'
import { defineConfig, type Plugin } from 'vite'
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
    // Plugin to trigger reload on public/sw.js changes
    {
      name: 'reload-on-sw-change',
      configureServer(server) {
        server.watcher.add('public/sw.js')
        server.watcher.on('change', (file) => {
          if (file.includes('sw.js')) {
            server.ws.send({ type: 'full-reload' })
          }
        })
      }
    } satisfies Plugin
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
