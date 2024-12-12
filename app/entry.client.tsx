import { StrictMode, startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'
import { LazyLoadableWorker, SearchWorkerProvider } from './hooks/useSearchWorker'

const worker = new LazyLoadableWorker()

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
