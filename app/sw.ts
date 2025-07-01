/// <reference lib="WebWorker" />

import { Hono } from 'hono'
import { fire } from 'hono/service-worker'
import type { Context, MiddlewareHandler } from 'hono'

// see: https://github.com/microsoft/TypeScript/issues/14877
declare var self: ServiceWorkerGlobalScope

type WasmExternRef = unknown
type ArrayBuilder = WasmExternRef
type BlinkIteratorRef = WasmExternRef

type TogepiiWasmDelegates = {
  iter_smoke: (i: number, seed: number) => void
  find_seed: (seed: number) => void
  search_togepii: (f_blink: number, seed_blink: number, f_smoke: number, seed_smoke: number) => void
}

type BlinkWasmDelegates = {
  find_seed: (seed: number) => void
}

type TogepiiWasmModule = {
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
  delegates: TogepiiWasmDelegates
}

type BlinkWasmModule = {
  find_seed_by_blink: (
    current: number,
    min: number,
    max: number,
    coolTime: number,
    tolerance: number,
    input: ArrayBuilder,
  ) => void
  new_array_builder: (length: number) => ArrayBuilder
  add_value: (builder: ArrayBuilder, value: number) => void
  blink_iter_new: (current: number, cooltime: number) => BlinkIteratorRef
  blink_iter_next: (iter: BlinkIteratorRef) => void
  blink_iter_get_interval: (iter: BlinkIteratorRef) => number
  blink_iter_get_seed: (iter: BlinkIteratorRef) => number
  delegates: BlinkWasmDelegates
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

type FindSeedByBlinkResult = {
  seed: number
}

type BlinkIteratorState = {
  seed: number
  interval: number
}

console.log('Service Worker v3.0 loaded')

let togepiiWasmModule: TogepiiWasmModule | null = null
let blinkWasmModule: BlinkWasmModule | null = null

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(self.clients.claim())
})

const app = new Hono().basePath('/CoSearchWASM/wasm-api')

// エラーハンドリングミドルウェア
const errorHandler: MiddlewareHandler = async (c, next) => {
  try {
    await next()
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorName = error instanceof Error ? error.name : 'Error'
    
    const errorResponse = {
      error: errorMessage,
      stack: errorStack,
      name: errorName,
    }
    
    // クライアントにエラー通知
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'WASM_API_ERROR',
          error: errorMessage,
          stack: errorStack,
          path: c.req.path,
        })
      })
    })
    
    return c.json(errorResponse, 500)
  }
}

app.use('*', errorHandler)

app.post('/iter-smoke', async (c) => {
  const { seed, take }: { seed: number; take: number } = await c.req.json()
  
  if (!togepiiWasmModule) {
    togepiiWasmModule = await loadTogepiiWasmModule()
  }
  
  const result = await executeIterSmoke(togepiiWasmModule, seed, take)
  
  return c.json(result)
})

app.post('/find-seed', async (c) => {
  const { h, a, b, c: cParam, d, s }: { h: number; a: number; b: number; c: number; d: number; s: number } = await c.req.json()
  
  if (!togepiiWasmModule) {
    togepiiWasmModule = await loadTogepiiWasmModule()
  }
  
  const result = await executeFindSeed(togepiiWasmModule, h, a, b, cParam, d, s)
  
  return c.json(result)
})

app.post('/search-togepii', async (c) => {
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
  
  if (!togepiiWasmModule) {
    togepiiWasmModule = await loadTogepiiWasmModule()
  }
  
  const result = await executeSearchTogepii(
    togepiiWasmModule, 
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
})

// Blink機能のルート追加
app.post('/find-seed-by-blink', async (c) => {
  const { 
    seed, 
    framesRange, 
    blink, 
    input 
  }: { 
    seed: number
    framesRange: [number, number]
    blink: { cooltime: number; tolerance: number }
    input: number[]
  } = await c.req.json()
  
  if (!blinkWasmModule) {
    blinkWasmModule = await loadBlinkWasmModule()
  }
  
  const result = await executeFindSeedByBlink(blinkWasmModule, seed, framesRange, blink, input)
  
  return c.json(result)
})

app.post('/blink-iterator-new', async (c) => {
  const { seed, cooltime }: { seed: number; cooltime: number } = await c.req.json()
  
  if (!blinkWasmModule) {
    blinkWasmModule = await loadBlinkWasmModule()
  }
  
  const iteratorRef = blinkWasmModule.blink_iter_new(seed, cooltime)
  
  // IteratorRefを文字列として保存（セッション管理）
  const iteratorId = Math.random().toString(36).substr(2, 9)
  iteratorStore.set(iteratorId, iteratorRef)
  
  return c.json({ iteratorId })
})

app.post('/blink-iterator-next', async (c) => {
  const { iteratorId }: { iteratorId: string } = await c.req.json()
  
  if (!blinkWasmModule) {
    blinkWasmModule = await loadBlinkWasmModule()
  }
  
  const iteratorRef = iteratorStore.get(iteratorId)
  if (!iteratorRef) {
    throw new Error('Iterator not found')
  }
  
  blinkWasmModule.blink_iter_next(iteratorRef)
  
  return c.json({ success: true })
})

app.post('/blink-iterator-get-state', async (c) => {
  const { iteratorId }: { iteratorId: string } = await c.req.json()
  
  if (!blinkWasmModule) {
    blinkWasmModule = await loadBlinkWasmModule()
  }
  
  const iteratorRef = iteratorStore.get(iteratorId)
  if (!iteratorRef) {
    throw new Error('Iterator not found')
  }
  
  const seed = blinkWasmModule.blink_iter_get_seed(iteratorRef)
  const interval = blinkWasmModule.blink_iter_get_interval(iteratorRef)
  
  return c.json({ seed: seed >>> 0, interval })
})

fire(app)

// BlinkIteratorのセッション管理
const iteratorStore = new Map<string, BlinkIteratorRef>()

const loadTogepiiWasmModule = async (): Promise<TogepiiWasmModule> => {
  const wasmUrl = '/CoSearchWASM/app/wasm/xd-togepii.wasm'
  
  const delegates: TogepiiWasmDelegates = {
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
          type: 'TOGEPII_WASM_ERROR',
          error: errorMessage,
          stack: errorStack,
        })
      })
    })
    throw error
  }
}

const loadBlinkWasmModule = async (): Promise<BlinkWasmModule> => {
  const wasmUrl = '/CoSearchWASM/app/wasm/xd-blink.wasm'
  
  const delegates: BlinkWasmDelegates = {
    find_seed: () => {},
  }

  const importObject = {
    spectest: {
      print_char: () => {},
    },
    callback: {
      find_seed: (seed: number) => {
        delegates.find_seed(seed)
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
      find_seed_by_blink,
      new_array_builder,
      add_value,
      blink_iter_new,
      blink_iter_next,
      blink_iter_get_interval,
      blink_iter_get_seed,
    } = instance.exports as { 
      find_seed_by_blink: (
        current: number,
        min: number,
        max: number,
        coolTime: number,
        tolerance: number,
        input: ArrayBuilder,
      ) => void
      new_array_builder: (length: number) => ArrayBuilder
      add_value: (builder: ArrayBuilder, value: number) => void
      blink_iter_new: (current: number, cooltime: number) => BlinkIteratorRef
      blink_iter_next: (iter: BlinkIteratorRef) => void
      blink_iter_get_interval: (iter: BlinkIteratorRef) => number
      blink_iter_get_seed: (iter: BlinkIteratorRef) => number
    }
    
    return { 
      find_seed_by_blink,
      new_array_builder,
      add_value,
      blink_iter_new,
      blink_iter_next,
      blink_iter_get_interval,
      blink_iter_get_seed,
      delegates 
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'BLINK_WASM_ERROR',
          error: errorMessage,
          stack: errorStack,
        })
      })
    })
    throw error
  }
}

const executeIterSmoke = async (wasmModule: TogepiiWasmModule, seed: number, take: number): Promise<IterSmokeResult[]> => {
  return new Promise((resolve) => {
    const results: IterSmokeResult[] = []
    
    wasmModule.delegates.iter_smoke = (i: number, seed: number) => {
      results.push({ i, seed: seed >>> 0 })
    }
    
    wasmModule.iter_smoke(seed, take)
    
    resolve(results)
  })
}

const executeFindSeed = async (wasmModule: TogepiiWasmModule, h: number, a: number, b: number, c: number, d: number, s: number): Promise<FindSeedResult[]> => {
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
  wasmModule: TogepiiWasmModule, 
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

const executeFindSeedByBlink = async (
  wasmModule: BlinkWasmModule,
  seed: number,
  framesRange: [number, number],
  blink: { cooltime: number; tolerance: number },
  input: number[]
): Promise<FindSeedByBlinkResult[]> => {
  return new Promise((resolve) => {
    const results: FindSeedByBlinkResult[] = []
    
    wasmModule.delegates.find_seed = (seed: number) => {
      results.push({ seed: seed >>> 0 })
    }
    
    const builder = wasmModule.new_array_builder(input.length)
    for (const value of input) {
      wasmModule.add_value(builder, value)
    }
    
    wasmModule.find_seed_by_blink(
      seed,
      framesRange[0],
      framesRange[1],
      blink.cooltime,
      blink.tolerance,
      builder
    )
    
    resolve(results)
  })
}