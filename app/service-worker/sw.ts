/// <reference lib="WebWorker" />

import { Hono } from 'hono'
import { app as pokedexApp } from './routes/pokedex'
import { app as wasmApp } from './routes/wasm'

// see: https://github.com/microsoft/TypeScript/issues/14877
declare var self: ServiceWorkerGlobalScope

console.log('API Worker v0.1 loaded')

self.addEventListener('install', () => {
  console.log('API Worker installing...')
  self.skipWaiting()
})
self.addEventListener('activate', (event) => {
  console.log('API Worker activating...')
  event.waitUntil(self.clients.claim())
})

const app = new Hono().basePath('/CoSearchWASM/api')

app.use('*', async (c, next) => {
  try {
    await next()
  } catch (error: unknown) {
    const res = {
      name: error instanceof Error ? error.name : 'Error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }
    return c.json(res, 500)
  }
})

app.route('/pokedex', pokedexApp)
app.route('/wasm', wasmApp)

const API_ROUTE = new URL('/CoSearchWASM/api', self.location.origin).href
self.addEventListener('fetch', async (evt: FetchEvent) => {
  // このservice worker自体は/CoSearchWASMがscopeになっていて、/api以外へのリクエストにも反応してしまうため、
  // /api/*以外へのリクエストだった場合は処理しないようにする必要がある
  // これをしておかないと、少なくともvite devではぶっ壊れる
  if (!evt.request.url.startsWith(API_ROUTE)) return

  // @ts-expect-error Passing FetchEvent but app.fetch expects ExecutionContext
  evt.respondWith(app.fetch(evt.request, {}, evt))
})
