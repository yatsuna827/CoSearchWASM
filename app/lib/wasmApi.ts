import type { LCG } from '@/domain/gc/lcg'

type IterSmokeResult = {
  i: number
  seed: LCG
}

export const iterSmoke = async (
  seed: number,
  take: number,
): Promise<IterSmokeResult[]> => {
  const response = await fetch('/CoSearchWASM/wasm-api/iterSmoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seed, take }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error('WASM API Error Details:', errorData)
    throw new Error(`WASM call failed: ${errorData.error || response.statusText}`)
  }

  const result = await response.json()

  return result.map((item: { i: number; seed: number }) => ({
    i: item.i,
    seed: (item.seed >>> 0) as LCG,
  }))
}