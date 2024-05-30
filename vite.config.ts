import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { copyFileSync } from 'node:fs'
import { join } from 'node:path'

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
    remix({
      ssr: false,
      basename: '/CoSearchWASM/',
      buildEnd(args) {
        if (!args.viteConfig.isProduction) return

        const buildPath = args.viteConfig.build.outDir
        copyFileSync(join(buildPath, 'index.html'), join(buildPath, '404.html'))
      },
    }),
    tsconfigPaths(),
  ],
})
