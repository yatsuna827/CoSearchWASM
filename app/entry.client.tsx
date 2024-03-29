import { RemixBrowser } from '@remix-run/react'
import { StrictMode, startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'
import './global.css'
import { LazyLoadableWorker, SearchWorkerProvider } from './hooks/useSearchWorker'

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <SearchWorkerProvider worker={new LazyLoadableWorker()}>
        <RemixBrowser />
      </SearchWorkerProvider>
    </StrictMode>,
  )
})
