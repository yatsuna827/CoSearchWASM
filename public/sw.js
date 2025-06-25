console.log('Service Worker v2.1 loaded')

let wasmModule = null

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  
  if (url.pathname === '/CoSearchWASM/wasm-api/iterSmoke' && event.request.method === 'POST') {
    event.respondWith(handleIterSmoke(event.request))
    return
  }
})

const handleIterSmoke = async (request) => {
  try {
    const { seed, take } = await request.json()
    
    if (!wasmModule) {
      wasmModule = await loadWasmModule()
    }
    
    const result = await executeIterSmoke(wasmModule, seed, take)
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const errorResponse = {
      error: error.message,
      stack: error.stack,
      name: error.name,
    }
    
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'ITER_SMOKE_ERROR',
          error: error.message,
          stack: error.stack,
        })
      })
    })
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

const loadWasmModule = async () => {
  const wasmUrl = '/CoSearchWASM/app/wasm/xd-togepii.wasm'
  
  const delegates = {
    iter_smoke: () => {},
  }
  
  const importObject = {
    spectest: {
      print_char: () => {},
    },
    callback: {
      iter_smoke: (...args) => {
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
    
    const { iter_smoke } = instance.exports
    
    return { iter_smoke, delegates }
  } catch (error) {
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'WASM_ERROR',
          error: error.message,
          stack: error.stack,
        })
      })
    })
    throw error
  }
}

const executeIterSmoke = async (wasmModule, seed, take) => {
  return new Promise((resolve) => {
    const results = []
    
    wasmModule.delegates.iter_smoke = (i, seed) => {
      results.push({ i, seed: seed >>> 0 })
    }
    
    wasmModule.iter_smoke(seed, take)
    
    resolve(results)
  })
}