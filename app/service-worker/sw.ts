/// <reference lib="WebWorker" />

// see: https://github.com/microsoft/TypeScript/issues/14877
declare var self: ServiceWorkerGlobalScope

import { Hono } from 'hono'
import { app as encounterTableApp } from './routes/encounter-table/route'
import { handleError } from './routes/error'
import { app as pokedexApp } from './routes/pokedex/route'
import { app as wasmApp } from './routes/wasm'

console.log('API Worker v0.1 loaded')

self.addEventListener('install', () => {
  console.log('API Worker installing...')
  self.skipWaiting()
})
self.addEventListener('activate', (event) => {
  console.log('API Worker activating...')
  event.waitUntil(self.clients.claim())
})

const BASE_PATH = '/CoSearchWASM/api'
const API_ROUTE = new URL(BASE_PATH, self.location.origin).href

const app = new Hono().basePath(BASE_PATH)
app.use('*', handleError)
app.route('/pokedex', pokedexApp)
app.route('/wasm', wasmApp)
app.route('/encounter-tables', encounterTableApp)

self.addEventListener('fetch', async (evt: FetchEvent) => {
  // このservice worker自体は/CoSearchWASMがscopeになっていて、/api以外へのリクエストにも反応してしまうため、
  // /api/*以外へのリクエストだった場合は処理しないようにする必要がある
  // これをしておかないと、少なくともvite devではぶっ壊れる
  if (!evt.request.url.startsWith(API_ROUTE)) return

  // @ts-expect-error Passing FetchEvent but app.fetch expects ExecutionContext
  evt.respondWith(app.fetch(evt.request, {}, evt))
})
