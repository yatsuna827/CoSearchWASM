import { StrictMode, startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'
import { LazyLoadableWorker, SearchWorkerProvider } from './hooks/useSearchWorker'

const worker = new LazyLoadableWorker()

// Register Service Worker for WASM API
// if ('serviceWorker' in navigator) {
//   const path = import.meta.env.MODE === 'production' ? '/CoSearchWASM/sw.js' : '/CoSearchWASM/dev-sw.js?dev-sw'

//   navigator.serviceWorker
//     .register(path, {
//       type: import.meta.env.MODE === 'production' ? 'classic' : 'module',
//       updateViaCache: 'none',
//     })
//     .then(
//       (registration) => {
//         console.log('Service Worker registered successfully:', registration.scope)
//         // Force update to get latest version
//         registration.update()
//       },
//       (error) => {
//         console.log('Service Worker registration failed:', error)
//       },
//     )

//   // Service Workerからのメッセージを受信
//   navigator.serviceWorker.addEventListener('message', (event) => {
//     if (event.data.type === 'WASM_ERROR') {
//       console.error('Service Worker WASM Error:', event.data.error)
//       console.error('Stack trace:', event.data.stack)
//     }
//     if (event.data.type === 'ITER_SMOKE_ERROR') {
//       console.error('Service Worker ITER_SMOKE Error:', event.data.error)
//       console.error('Stack trace:', event.data.stack)
//     }
//   })
// }

navigator.serviceWorker.getRegistrations().then(function (registrations) {
  for (const registration of registrations) {
    registration.unregister()
  }
})

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <SearchWorkerProvider worker={worker}>
        <HydratedRouter />
      </SearchWorkerProvider>
    </StrictMode>,
  )
})
