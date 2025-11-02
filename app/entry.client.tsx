import { StrictMode, startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'
import { LazyLoadableWorker, SearchWorkerProvider } from './hooks/useSearchWorker'

const worker = new LazyLoadableWorker()

// Register Service Worker for WASM API
if ('serviceWorker' in navigator) {
  const isProduction = import.meta.env.MODE === 'production'

  navigator.serviceWorker
    .register(isProduction ? '/CoSearchWASM/sw.js' : '/CoSearchWASM/dev-sw.js?dev-sw', {
      type: isProduction ? 'classic' : 'module',
      updateViaCache: 'none',
      scope: '/CoSearchWASM/',
    })
    .then(
      (registration) => {
        console.log('Service Worker registered successfully:', registration.scope)
        registration.update()
      },
      (error) => {
        console.log('Service Worker registration failed:', error)
      },
    )
}

// Clear ServiceWorkers
// navigator.serviceWorker.getRegistrations().then(function (registrations) {
//   for (const registration of registrations) {
//     registration.unregister()
//   }
// })

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
