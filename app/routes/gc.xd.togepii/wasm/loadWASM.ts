import type { LCG } from '@/domain/gc/lcg'
import type { Attributes } from '@/domain/type'
import wasm from '@/wasm/xd-togepii.wasm?url'

type WasmExternRef = Branded<unknown, 'WASMExternRef'>
type BlinkObject = Branded<WasmExternRef, 'BlinkObject'>

type SearchTogepiiCallbackFnArgs = [
  f_blink: number,
  seed_blink: number,
  f_smoke: number,
  seed_smoke: number,
]
type IterSmokeCallbackFnArgs = [i: number, seed: number]
type FindSeedCallbackFnArgs = Attributes

type SearchTogepiiFn = (
  seed: number,
  target: number,
  obj: BlinkObject,
  minInterval: number,
  maxInterval: number,
  minBlinkFrames: number,
  maxBlinkFrames: number,
  minFrames: number,
  maxFrames: number,
) => void
type NewBlinkFn = (cooltime: number, delay?: number) => BlinkObject
type IterSmokeFn = (seed: number, take: number) => void
type FindSeedFn = (h: number, a: number, b: number, c: number, d: number, s: number) => void

type ExportedFunctions = {
  search_togepii: SearchTogepiiFn
  new_blink: NewBlinkFn
  iter_smoke: IterSmokeFn
  find_seed: FindSeedFn
}

type Callbacks = {
  search_togepii: (...args: SearchTogepiiCallbackFnArgs) => void
  iter_smoke: (...args: IterSmokeCallbackFnArgs) => void
  find_seed: (...args: FindSeedCallbackFnArgs) => void
}

export type LoadWASMReturn = Promise<{
  searchTogepii: (
    seed: number,
    target: number,
    options: {
      blink: {
        cooltime: number
        intervalRange: [min: number, max: number]
        framesRange: [min: number, max: number]
      }
      smoke: {
        framesRange: [min: number, max: number]
      }
    },
  ) => [number, LCG, number, LCG][]
  iterSmoke: (seed: number, take: number) => { i: number; seed: LCG }[]
  findSeed: (ivs: Attributes) => LCG[]
}>
export const loadWASM = async (): LoadWASMReturn => {
  const delegates: Callbacks = {
    search_togepii: () => {
      console.warn('コールバック関数が設定される前にWASM関数が呼び出されました')
    },
    iter_smoke: () => {
      console.warn('コールバック関数が設定される前にWASM関数が呼び出されました')
    },
    find_seed: () => {
      console.warn('コールバック関数が設定される前にWASM関数が呼び出されました')
    },
  }

  const importObject = {
    // moonbitのprintlnを受けるためにデフォルトで要求される
    spectest: {
      print_char: () => {},
    },
    callback: {
      search_togepii: (...args) => {
        delegates.search_togepii(...args)
      },
      iter_smoke: (...args) => {
        delegates.iter_smoke(...args)
      },
      find_seed: (...args) => {
        delegates.find_seed(...args)
      },
    } satisfies Callbacks,
  }

  const { search_togepii, new_blink, iter_smoke, find_seed } =
    await WebAssembly.instantiateStreaming(fetch(wasm), importObject).then(
      (_) => _.instance.exports as ExportedFunctions,
    )

  const searchTogepii = (
    seed: number,
    target: number,
    options: {
      blink: {
        cooltime: number
        intervalRange: [min: number, max: number]
        framesRange: [min: number, max: number]
      }
      smoke: {
        framesRange: [min: number, max: number]
      }
    },
  ) => {
    const results: [number, LCG, number, LCG][] = []
    delegates.search_togepii = (f_blink, seed_blink, f_smoke, seed_smoke) => {
      results.push([f_blink, (seed_blink >>> 0) as LCG, f_smoke, (seed_smoke >>> 0) as LCG])
    }

    search_togepii(
      seed,
      target,
      new_blink(options.blink.cooltime),
      ...options.blink.intervalRange,
      ...options.blink.framesRange,
      ...options.smoke.framesRange,
    )

    return results
  }

  const iterSmoke = (seed: number, take: number) => {
    const results: { i: number; seed: LCG }[] = []

    delegates.iter_smoke = (i, seed) => {
      results.push({ i, seed: (seed >>> 0) as LCG })
    }

    iter_smoke(seed, take)

    return results
  }

  const findSeed = (ivs: Attributes) => {
    const results: LCG[] = []

    delegates.find_seed = (seed) => {
      results.push((seed >>> 0) as LCG)
    }

    find_seed(...ivs)

    return results
  }

  return { searchTogepii, iterSmoke, findSeed }
}
