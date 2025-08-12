import { useState } from 'react'
import { iterSmoke, findSeed, searchTogepii } from '@/lib/wasmApi'
import type { LCG } from '@/domain/gc/lcg'

type SmokeResult = { i: number; seed: LCG }
type FindSeedResult = { seed: LCG }
type SearchTogepiiResult = {
  f_blink: number
  seed_blink: LCG
  f_smoke: number
  seed_smoke: LCG
}

const WasmServiceWorkerPoc: React.FC = () => {
  const [seed, setSeed] = useState<string>('0x12345678')
  const [take, setTake] = useState<number>(10)
  const [activeTest, setActiveTest] = useState<'smoke' | 'findSeed' | 'searchTogepii'>('smoke')

  // Results for different tests
  const [smokeResults, setSmokeResults] = useState<SmokeResult[]>([])
  const [findSeedResults, setFindSeedResults] = useState<FindSeedResult[]>([])
  const [searchTogepiiResults, setSearchTogepiiResults] = useState<SearchTogepiiResult[]>([])

  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Find Seed form data
  const [findSeedParams, setFindSeedParams] = useState({
    h: 31,
    a: 31,
    b: 31,
    c: 31,
    d: 31,
    s: 31,
  })

  // Search Togepii form data
  const [searchTogepiiParams, setSearchTogepiiParams] = useState({
    target: 32768,
    blink: { cooltime: 180 },
    minInterval: 60,
    maxInterval: 240,
    minBlinkFrames: 1,
    maxBlinkFrames: 180,
    minFrames: 1,
    maxFrames: 1000,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (activeTest === 'smoke') {
        const seedNum = parseInt(seed, 16)
        const results = await iterSmoke(seedNum, take)
        setSmokeResults(results)
      } else if (activeTest === 'findSeed') {
        const { h, a, b, c, d, s } = findSeedParams
        const results = await findSeed(h, a, b, c, d, s)
        setFindSeedResults(results)
      } else if (activeTest === 'searchTogepii') {
        const seedNum = parseInt(seed, 16)
        const { target, blink, minInterval, maxInterval, minBlinkFrames, maxBlinkFrames, minFrames, maxFrames } =
          searchTogepiiParams
        const results = await searchTogepii(
          seedNum,
          target,
          blink,
          minInterval,
          maxInterval,
          minBlinkFrames,
          maxBlinkFrames,
          minFrames,
          maxFrames,
        )
        setSearchTogepiiResults(results)
      }
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

      {/* Test Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Test Type</label>
        <div className="flex gap-4">
          {(['smoke', 'findSeed', 'searchTogepii'] as const).map((type) => (
            <label key={type} className="flex items-center">
              <input
                type="radio"
                value={type}
                checked={activeTest === type}
                onChange={(e) => setActiveTest(e.target.value as 'smoke' | 'findSeed' | 'searchTogepii')}
                className="mr-2"
              />
              {type === 'smoke' ? 'Iter Smoke' : type === 'findSeed' ? 'Find Seed' : 'Search Togepii'}
            </label>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        {/* Common seed input for smoke and searchTogepii */}
        {(activeTest === 'smoke' || activeTest === 'searchTogepii') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Seed (hex)</label>
            <input
              type="text"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded"
              placeholder="0x12345678"
            />
          </div>
        )}

        {/* Smoke-specific inputs */}
        {activeTest === 'smoke' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Take</label>
            <input
              type="number"
              value={take}
              onChange={(e) => setTake(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded"
              min="1"
              max="100"
            />
          </div>
        )}

        {/* Find Seed inputs */}
        {activeTest === 'findSeed' && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            {(['h', 'a', 'b', 'c', 'd', 's'] as const).map((param) => (
              <div key={param}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{param.toUpperCase()}</label>
                <input
                  type="number"
                  value={findSeedParams[param]}
                  onChange={(e) =>
                    setFindSeedParams((prev) => ({
                      ...prev,
                      [param]: Number(e.target.value),
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded w-full"
                  min="0"
                  max="31"
                />
              </div>
            ))}
          </div>
        )}

        {/* Search Togepii inputs */}
        {activeTest === 'searchTogepii' && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
              <input
                type="number"
                value={searchTogepiiParams.target}
                onChange={(e) =>
                  setSearchTogepiiParams((prev) => ({
                    ...prev,
                    target: Number(e.target.value),
                  }))
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blink Cooltime</label>
              <input
                type="number"
                value={searchTogepiiParams.blink.cooltime}
                onChange={(e) =>
                  setSearchTogepiiParams((prev) => ({
                    ...prev,
                    blink: { ...prev.blink, cooltime: Number(e.target.value) },
                  }))
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading
            ? 'Computing...'
            : `Run ${activeTest === 'smoke' ? 'Iter Smoke' : activeTest === 'findSeed' ? 'Find Seed' : 'Search Togepii'}`}
        </button>
      </form>

      {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">Error: {error}</div>}

      {/* Results */}
      {activeTest === 'smoke' && smokeResults.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Smoke Results:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {smokeResults
              .map((result) => `${result.i}: 0x${result.seed.toString(16).toUpperCase().padStart(8, '0')}\n`)
              .join('')}
          </pre>
        </div>
      )}

      {activeTest === 'findSeed' && findSeedResults.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Find Seed Results:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {findSeedResults
              .map((result, index) => `Seed ${index}: 0x${result.seed.toString(16).toUpperCase().padStart(8, '0')}\n`)
              .join('')}
          </pre>
        </div>
      )}

      {activeTest === 'searchTogepii' && searchTogepiiResults.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Search Togepii Results:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {searchTogepiiResults
              .map(
                (result, index) =>
                  `Result ${index}: Blink F${result.f_blink} (0x${result.seed_blink.toString(16).toUpperCase().padStart(8, '0')}) | Smoke F${result.f_smoke} (0x${result.seed_smoke.toString(16).toUpperCase().padStart(8, '0')})\n`,
              )
              .join('')}
          </pre>
        </div>
      )}
    </div>
  )
}

export default WasmServiceWorkerPoc
