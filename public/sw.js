// Service Worker for WASM function calls via fetch API
// Handles custom WASM API endpoints for WebAPI-style WASM function calls
// Version: 2.1

console.log('Service Worker v2.1 loaded')

let wasmModule = null

// Add install and activate event listeners for debugging
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(self.clients.claim())
})

// Handle fetch events
self.addEventListener('fetch', (event) => {
  console.log('Service Worker intercepted request:', event.request.url)
  const url = new URL(event.request.url)
  console.log('Request pathname:', url.pathname, 'Method:', event.request.method)
  console.log('Full URL object:', {
    href: url.href,
    origin: url.origin,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash
  })
  
  // Handle /CoSearchWASM/wasm-api/iterSmoke POST requests
  if (url.pathname === '/CoSearchWASM/wasm-api/iterSmoke' && event.request.method === 'POST') {
    console.log('✅ Handling WASM API request for iterSmoke')
    event.respondWith(handleIterSmoke(event.request))
    return // 重要: returnしてデフォルト処理を防ぐ
  }
  
  
  console.log('❌ Request not handled by Service Worker - pathname:', url.pathname, 'method:', event.request.method)
})

async function handleIterSmoke(request) {
  try {
    const { seed, take } = await request.json()
    
    // Load WASM module if not already loaded
    if (!wasmModule) {
      wasmModule = await loadWasmModule()
    }
    
    // Execute iterSmoke
    const result = await executeIterSmoke(wasmModule, seed, take)
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in handleIterSmoke:', error)
    const errorResponse = { 
      error: error.message,
      stack: error.stack,
      name: error.name
    }
    console.log('Sending error response:', errorResponse)
    
    // Send error to main page
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'ITER_SMOKE_ERROR',
          error: error.message,
          stack: error.stack
        })
      })
    })
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function loadWasmModule() {
  console.log('Loading WASM module...')
  
  // Load WASM module (similar to existing loadWASM.ts logic)
  const wasmUrl = '/CoSearchWASM/app/wasm/xd-togepii.wasm'
  console.log('WASM URL:', wasmUrl)
  
  const delegates = {
    iter_smoke: () => {
      console.warn('コールバック関数が設定される前にWASM関数が呼び出されました')
    }
  }
  
  const importObject = {
    // moonbitのprintlnを受けるためにデフォルトで要求される
    spectest: {
      print_char: () => {},
    },
    callback: {
      iter_smoke: (...args) => {
        console.log('WASM iter_smoke callback called with:', args)
        delegates.iter_smoke(...args)
      },
      find_seed: (...args) => {
        console.log('WASM find_seed callback called with:', args)
        // find_seed機能は今回のPOCでは使用しないため空実装
      },
      search_togepii: (...args) => {
        console.log('WASM search_togepii callback called with:', args)
        // search_togepii機能は今回のPOCでは使用しないため空実装
      },
    }
  }
  
  try {
    console.log('Fetching WASM file...')
    const response = await fetch(wasmUrl)
    console.log('WASM fetch response status:', response.status)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch WASM: ${response.status} ${response.statusText}`)
    }
    
    console.log('Instantiating WASM...')
    const { instance } = await WebAssembly.instantiateStreaming(response, importObject)
    console.log('WASM instantiated successfully')
    
    const { iter_smoke } = instance.exports
    console.log('WASM exports:', Object.keys(instance.exports))
    
    return { iter_smoke, delegates }
  } catch (error) {
    console.error('Error loading WASM module:', error)
    // エラー情報をメインページに送信
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'WASM_ERROR',
          error: error.message,
          stack: error.stack
        })
      })
    })
    throw error
  }
}

async function executeIterSmoke(wasmModule, seed, take) {
  return new Promise((resolve) => {
    const results = []
    
    // Set up callback to collect results
    wasmModule.delegates.iter_smoke = (i, seed) => {
      results.push({ i, seed: seed >>> 0 })
    }
    
    // Execute WASM function
    wasmModule.iter_smoke(seed, take)
    
    resolve(results)
  })
}