/// <reference lib="WebWorker" />

import { Hono } from 'hono'
import { fire } from 'hono/service-worker'

// see: https://github.com/microsoft/TypeScript/issues/14877
declare var self: ServiceWorkerGlobalScope

type WasmDelegates = {
  iter_smoke: (i: number, seed: number) => void
  find_seed: (seed: number) => void
  search_togepii: (f_blink: number, seed_blink: number, f_smoke: number, seed_smoke: number) => void
}

type WasmModule = {
  iter_smoke: (seed: number, take: number) => void
  find_seed: (h: number, a: number, b: number, c: number, d: number, s: number) => void
  search_togepii: (
    seed: number,
    target: number,
    obj: unknown,
    minInterval: number,
    maxInterval: number,
    minBlinkFrames: number,
    maxBlinkFrames: number,
    minFrames: number,
    maxFrames: number,
  ) => void
  new_blink: (cooltime: number, delay?: number) => unknown
  delegates: WasmDelegates
}

type IterSmokeResult = {
  i: number
  seed: number
}

type FindSeedResult = {
  seed: number
}

type SearchTogepiiResult = {
  f_blink: number
  seed_blink: number
  f_smoke: number
  seed_smoke: number
}

console.log('Service Worker v3.0 loaded')

let wasmModule: WasmModule | null = null

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(self.clients.claim())
})

const app = new Hono().basePath('/CoSearchWASM/wasm-api')

app.post('/iterSmoke', async (c) => {
  try {
    const { seed, take }: { seed: number; take: number } = await c.req.json()
    
    if (!wasmModule) {
      wasmModule = await loadWasmModule()
    }
    
    const result = await executeIterSmoke(wasmModule, seed, take)
    
    return c.json(result)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorName = error instanceof Error ? error.name : 'Error'
    
    const errorResponse = {
      error: errorMessage,
      stack: errorStack,
      name: errorName,
    }
    
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'ITER_SMOKE_ERROR',
          error: errorMessage,
          stack: errorStack,
        })
      })
    })
    
    return c.json(errorResponse, 500)
  }
})

app.post('/findSeed', async (c) => {
  try {
    const { h, a, b, c: cParam, d, s }: { h: number; a: number; b: number; c: number; d: number; s: number } = await c.req.json()
    
    if (!wasmModule) {
      wasmModule = await loadWasmModule()
    }
    
    const result = await executeFindSeed(wasmModule, h, a, b, cParam, d, s)
    
    return c.json(result)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorName = error instanceof Error ? error.name : 'Error'
    
    const errorResponse = {
      error: errorMessage,
      stack: errorStack,
      name: errorName,
    }
    
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'FIND_SEED_ERROR',
          error: errorMessage,
          stack: errorStack,
        })
      })
    })
    
    return c.json(errorResponse, 500)
  }
})

app.post('/searchTogepii', async (c) => {
  try {
    const { 
      seed, 
      target, 
      blink, 
      minInterval, 
      maxInterval, 
      minBlinkFrames, 
      maxBlinkFrames, 
      minFrames, 
      maxFrames 
    }: { 
      seed: number
      target: number
      blink: { cooltime: number; delay?: number }
      minInterval: number
      maxInterval: number
      minBlinkFrames: number
      maxBlinkFrames: number
      minFrames: number
      maxFrames: number
    } = await c.req.json()
    
    if (!wasmModule) {
      wasmModule = await loadWasmModule()
    }
    
    const result = await executeSearchTogepii(
      wasmModule, 
      seed, 
      target, 
      blink, 
      minInterval, 
      maxInterval, 
      minBlinkFrames, 
      maxBlinkFrames, 
      minFrames, 
      maxFrames
    )
    
    return c.json(result)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorName = error instanceof Error ? error.name : 'Error'
    
    const errorResponse = {
      error: errorMessage,
      stack: errorStack,
      name: errorName,
    }
    
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'SEARCH_TOGEPII_ERROR',
          error: errorMessage,
          stack: errorStack,
        })
      })
    })
    
    return c.json(errorResponse, 500)
  }
})

fire(app)

const loadWasmModule = async (): Promise<WasmModule> => {
  const wasmUrl = '/CoSearchWASM/app/wasm/xd-togepii.wasm'
  
  const delegates: WasmDelegates = {
    iter_smoke: () => {},
    find_seed: () => {},
    search_togepii: () => {},
  }

  const importObject = {
    spectest: {
      print_char: () => {},
    },
    callback: {
      iter_smoke: (...args: [number, number]) => {
        delegates.iter_smoke(...args)
      },
      find_seed: (seed: number) => {
        delegates.find_seed(seed)
      },
      search_togepii: (...args: [number, number, number, number]) => {
        delegates.search_togepii(...args)
      },
    },
  }

  try {
    const response = await fetch(wasmUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch WASM: ${response.status} ${response.statusText}`)
    }

    const { instance } = await WebAssembly.instantiateStreaming(response, importObject)
    
    const { 
      iter_smoke, 
      find_seed, 
      search_togepii, 
      new_blink 
    } = instance.exports as { 
      iter_smoke: (seed: number, take: number) => void
      find_seed: (h: number, a: number, b: number, c: number, d: number, s: number) => void
      search_togepii: (
        seed: number,
        target: number,
        obj: unknown,
        minInterval: number,
        maxInterval: number,
        minBlinkFrames: number,
        maxBlinkFrames: number,
        minFrames: number,
        maxFrames: number,
      ) => void
      new_blink: (cooltime: number, delay?: number) => unknown
    }
    
    return { iter_smoke, find_seed, search_togepii, new_blink, delegates }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'WASM_ERROR',
          error: errorMessage,
          stack: errorStack,
        })
      })
    })
    throw error
  }
}

const executeIterSmoke = async (wasmModule: WasmModule, seed: number, take: number): Promise<IterSmokeResult[]> => {
  return new Promise((resolve) => {
    const results: IterSmokeResult[] = []
    
    wasmModule.delegates.iter_smoke = (i: number, seed: number) => {
      results.push({ i, seed: seed >>> 0 })
    }
    
    wasmModule.iter_smoke(seed, take)
    
    resolve(results)
  })
}

const executeFindSeed = async (wasmModule: WasmModule, h: number, a: number, b: number, c: number, d: number, s: number): Promise<FindSeedResult[]> => {
  return new Promise((resolve) => {
    const results: FindSeedResult[] = []
    
    wasmModule.delegates.find_seed = (seed: number) => {
      results.push({ seed: seed >>> 0 })
    }
    
    wasmModule.find_seed(h, a, b, c, d, s)
    
    resolve(results)
  })
}

const executeSearchTogepii = async (
  wasmModule: WasmModule, 
  seed: number, 
  target: number, 
  blink: { cooltime: number; delay?: number }, 
  minInterval: number, 
  maxInterval: number, 
  minBlinkFrames: number, 
  maxBlinkFrames: number, 
  minFrames: number, 
  maxFrames: number
): Promise<SearchTogepiiResult[]> => {
  return new Promise((resolve) => {
    const results: SearchTogepiiResult[] = []
    
    wasmModule.delegates.search_togepii = (f_blink: number, seed_blink: number, f_smoke: number, seed_smoke: number) => {
      results.push({ 
        f_blink, 
        seed_blink: seed_blink >>> 0, 
        f_smoke, 
        seed_smoke: seed_smoke >>> 0 
      })
    }
    
    const blinkObj = wasmModule.new_blink(blink.cooltime, blink.delay)
    wasmModule.search_togepii(seed, target, blinkObj, minInterval, maxInterval, minBlinkFrames, maxBlinkFrames, minFrames, maxFrames)
    
    resolve(results)
  })
}