import type { MetaFunction } from '@remix-run/node'
import { useEffect, useRef, useState } from 'react'

import { type Remote, wrap } from 'comlink'

import type { WorkerAPI } from '@dotnet/main.worker'
import SearchWorker from '../../modules/dotnet/main.worker?worker'

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix SPA' },
    { name: 'description', content: 'Welcome to Remix (SPA Mode)!' },
  ]
}

type SearchResult = {
  index: number
  seed: string
  ivs: [number, number, number, number, number, number]
  pid: string
  nature: string
  ability: string
  gcAbility: string
}

// #3498db
// #e67e22
// #f2f2f2
// #c0392b

export default function Index() {
  const [results, setResults] = useState<SearchResult[]>([])
  const seedInputRef = useRef<HTMLInputElement>(null)

  //const [workerIsReady, setWorkerIsReady] = useState(false)
  const workerRef = useRef<Remote<WorkerAPI> | null>(null)

  useEffect(() => {
    const worker = new SearchWorker()
    workerRef.current = wrap(worker)

    return () => {
      worker.terminate()
    }
  }, [])

  const handleClick = async () => {
    const worker = workerRef.current
    if (!worker) return

    if (!seedInputRef.current) return

    const seed = seedInputRef.current.value

    if (!/[0-9a-fA-F]{1,8}/.test(seed)) return

    const result = await worker.searchNearby({
      name: 'ヌオー',
      nature: 25,
      max: 10000,
      ivsMin: [31, 0, 0, 0, 0, 0],
      seedHex: seed,
    })
    setResults(result ?? [])
  }

  return (
    <div
      style={{
        fontFamily: 'system-ui, sans-serif',
        lineHeight: '1.8',
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <div className="sidebar">
        <button type="button" onClick={handleClick}>
          Search
        </button>
        <label htmlFor="seed-input">seed</label>
        <input id="seed-input" ref={seedInputRef} />
      </div>
      <div
        className="content"
        style={{
          overflowX: 'hidden',
          overflowY: 'scroll',
        }}
      >
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th scope="col" />
                <th scope="col" />
                <th scope="col" colSpan={6}>
                  IVs
                </th>
              </tr>
              <tr>
                <th scope="col">Index</th>
                <th scope="col">Seed</th>
                <th scope="col">H</th>
                <th scope="col">A</th>
                <th scope="col">B</th>
                <th scope="col">C</th>
                <th scope="col">D</th>
                <th scope="col">S</th>
              </tr>
            </thead>
            <tbody>
              {results.map(({ index, seed, ivs }) => (
                <tr key={index}>
                  <td>{index}</td>
                  <td>{seed}</td>
                  {ivs.map((iv, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    <td key={i}>{iv}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
