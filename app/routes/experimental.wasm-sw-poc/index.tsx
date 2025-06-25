import { useState } from 'react'
import { iterSmoke } from '@/lib/wasmApi'
import type { LCG } from '@/domain/gc/lcg'

type SmokeResult = { i: number; seed: LCG }

const WasmServiceWorkerPoc: React.FC = () => {
  const [seed, setSeed] = useState<string>('0x12345678')
  const [take, setTake] = useState<number>(10)
  const [results, setResults] = useState<SmokeResult[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const seedNum = parseInt(seed, 16)
      const smokeResults = await iterSmoke(seedNum, take)
      setResults(smokeResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">WASM Service Worker POC</h1>
      <p className="mb-4 text-gray-600">
        This demonstrates calling WASM functions via Service Worker using standard fetch() API
      </p>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-4 items-end mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seed (hex)
            </label>
            <input
              type="text"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded"
              placeholder="0x12345678"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Take
            </label>
            <input
              type="number"
              value={take}
              onChange={(e) => setTake(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded"
              min="1"
              max="100"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Computing...' : 'Run iterSmoke'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {results.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Results:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {results.map((result, index) => (
              `${result.i}: 0x${result.seed.toString(16).toUpperCase().padStart(8, '0')}\n`
            )).join('')}
          </pre>
        </div>
      )}
    </div>
  )
}

export default WasmServiceWorkerPoc