import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
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
    remix({
      ssr: false,
    }),
    tsconfigPaths(),
  ],
})
