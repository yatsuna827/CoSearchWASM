import type { WorkerAPI } from '@dotnet/main.worker'
import type { Remote } from 'comlink'

import { wrap } from 'comlink'
import { type ReactNode, createContext, useContext, useEffect } from 'react'

import SearchWorker from '@dotnet/main.worker?worker'

// 「普通にuseRefでWorker | nullを持つのと変わらないのでは？」という気持ちになってきた
// 一応、「Workerの死活制御を行う仕組み」自体はReactに依存しないという点ではより疎結合と言えるかも
// WorkerがisTerminatedを持っていてくれればよかったんじゃないかなぁ…

export class LazyLoadableWorker {
  #worker: Worker | null

  constructor() {
    this.#worker = null
  }

  load() {
    this.#worker ??= new SearchWorker()
  }

  terminate() {
    this.#worker?.terminate()
    this.#worker = null
  }

  getProxy() {
    if (this.#worker == null) throw new Error('Worker has not loaded.')

    return wrap<WorkerAPI>(this.#worker)
  }
}

const SearchWorkerContext = createContext<LazyLoadableWorker | null>(null)
type SearchWorkerProviderProps = {
  worker: LazyLoadableWorker
  children: ReactNode
}
export const SearchWorkerProvider = ({ worker, children }: SearchWorkerProviderProps) => {
  useEffect(() => {
    worker.load()

    return () => worker.terminate()
  }, [worker])

  return <SearchWorkerContext.Provider value={worker}>{children}</SearchWorkerContext.Provider>
}

export const useSearchWorker = (): Remote<WorkerAPI> => {
  const worker = useContext(SearchWorkerContext)
  if (worker == null) throw new Error('Called outside of SearchWorkerContext.')

  return worker.getProxy()
}
