import { execSync } from 'node:child_process'
import { copyFileSync, existsSync, readdirSync } from 'node:fs'
import { basename, resolve } from 'node:path'

execSync('moon build')

const DIR_SRC = './target/wasm-gc/release/build/app'

const files = readdirSync(DIR_SRC, {
  recursive: true,
  encoding: 'utf-8',
}).filter((p) => p.endsWith('.wasm'))

const DIR_DIST = './app/wasm'
for (const p of files) {
  copyFileSync(resolve(DIR_SRC, p), resolve(DIR_DIST, basename(p)))
}
