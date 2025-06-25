const swSelf = globalThis as unknown as ServiceWorkerGlobalScope

type WasmDelegates = {
  iter_smoke: (i: number, seed: number) => void
}

type WasmModule = {
  iter_smoke: (seed: number, take: number) => void
  delegates: WasmDelegates
}

type IterSmokeResult = {
  i: number
  seed: number
}

console.log('Service Worker v2.1 loaded')

let wasmModule: WasmModule | null = null

swSelf.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  swSelf.skipWaiting()
})

swSelf.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(swSelf.clients.claim())
})

swSelf.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  
  if (url.pathname === '/CoSearchWASM/wasm-api/iterSmoke' && event.request.method === 'POST') {
    event.respondWith(handleIterSmoke(event.request))
    return
  }
})

const handleIterSmoke = async (request: Request): Promise<Response> => {
  try {
    const { seed, take }: { seed: number; take: number } = await request.json()
    
    if (!wasmModule) {
      wasmModule = await loadWasmModule()
    }
    
    const result = await executeIterSmoke(wasmModule, seed, take)
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorName = error instanceof Error ? error.name : 'Error'
    
    const errorResponse = {
      error: errorMessage,
      stack: errorStack,
      name: errorName,
    }
    
    swSelf.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'ITER_SMOKE_ERROR',
          error: errorMessage,
          stack: errorStack,
        })
      })
    })
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

const loadWasmModule = async (): Promise<WasmModule> => {
  const wasmUrl = '/CoSearchWASM/app/wasm/xd-togepii.wasm'
  
  const delegates: WasmDelegates = {
    iter_smoke: () => {},
  }

  const importObject = {
    spectest: {
      print_char: () => {},
    },
    callback: {
      iter_smoke: (...args: [number, number]) => {
        delegates.iter_smoke(...args)
      },
      find_seed: () => {},
      search_togepii: () => {},
    },
  }

  try {
    const response = await fetch(wasmUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch WASM: ${response.status} ${response.statusText}`)
    }

    const { instance } = await WebAssembly.instantiateStreaming(response, importObject)
    
    const { iter_smoke } = instance.exports as { iter_smoke: (seed: number, take: number) => void }
    
    return { iter_smoke, delegates }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    swSelf.clients.matchAll().then((clients) => {
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