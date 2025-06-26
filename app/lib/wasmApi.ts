import type { LCG } from '@/domain/gc/lcg'

type IterSmokeResult = {
  i: number
  seed: LCG
}

type FindSeedResult = {
  seed: LCG
}

type SearchTogepiiResult = {
  f_blink: number
  seed_blink: LCG
  f_smoke: number
  seed_smoke: LCG
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

export const findSeed = async (
  h: number,
  a: number, 
  b: number,
  c: number,
  d: number,
  s: number,
): Promise<FindSeedResult[]> => {
  const response = await fetch('/CoSearchWASM/wasm-api/findSeed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ h, a, b, c, d, s }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error('WASM API Error Details:', errorData)
    throw new Error(`WASM call failed: ${errorData.error || response.statusText}`)
  }

  const result = await response.json()

  return result.map((item: { seed: number }) => ({
    seed: (item.seed >>> 0) as LCG,
  }))
}

export const searchTogepii = async (
  seed: number,
  target: number,
  blink: { cooltime: number; delay?: number },
  minInterval: number,
  maxInterval: number,
  minBlinkFrames: number,
  maxBlinkFrames: number,
  minFrames: number,
  maxFrames: number,
): Promise<SearchTogepiiResult[]> => {
  const response = await fetch('/CoSearchWASM/wasm-api/searchTogepii', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      seed, 
      target, 
      blink, 
      minInterval, 
      maxInterval, 
      minBlinkFrames, 
      maxBlinkFrames, 
      minFrames, 
      maxFrames 
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error('WASM API Error Details:', errorData)
    throw new Error(`WASM call failed: ${errorData.error || response.statusText}`)
  }

  const result = await response.json()

  return result.map((item: { f_blink: number; seed_blink: number; f_smoke: number; seed_smoke: number }) => ({
    f_blink: item.f_blink,
    seed_blink: (item.seed_blink >>> 0) as LCG,
    f_smoke: item.f_smoke,
    seed_smoke: (item.seed_smoke >>> 0) as LCG,
  }))
}