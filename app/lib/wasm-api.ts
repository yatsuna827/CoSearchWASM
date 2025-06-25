import type { LCG } from '@/domain/gc/lcg'

/**
 * WebAPI-style WASM function calls via Service Worker
 * This provides a standard fetch()-like interface for WASM functions
 */

export async function iterSmoke(seed: number, take: number): Promise<{ i: number; seed: LCG }[]> {
  const response = await fetch('/CoSearchWASM/wasm-api/iterSmoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seed, take })
  })
  
  if (!response.ok) {
    const errorData = await response.json()
    console.error('WASM API Error Details:', errorData)
    throw new Error(`WASM call failed: ${errorData.error || response.statusText}`)
  }
  
  const result = await response.json()
  
  // Ensure proper LCG branding
  return result.map((item: any) => ({
    i: item.i,
    seed: (item.seed >>> 0) as LCG
  }))
}