import type { LCG } from '@/domain/gc/lcg'
import wasm from '@/wasm/xd-blink.wasm?url'

type WasmExternRef = Branded<unknown, 'WASMExternRef'>
type ArrayBuilder = Branded<WasmExternRef, 'ArrayBuilder'>
type BlinkIteratorRef = Branded<WasmExternRef, 'BlinkIterator'>

type OnFoundSeedCallbackFnArgs = [seed: number]

type SearchFn = (
  current: LCG,
  min: number,
  max: number,
  coolTime: number,
  tolerance: number,
  input: ArrayBuilder,
) => void
type NewBuilderFn = (length: number) => ArrayBuilder
type AddValueFn = (builder: ArrayBuilder, value: number) => void
type NewBlinkIteratorFn = (current: LCG, cooltime: number) => BlinkIteratorRef
type BlinkIteratorNextFn = (iter: BlinkIteratorRef) => void
type BlinkIteratorGetIntervalFn = (iter: BlinkIteratorRef) => number
type BlinkIteratorGetSeedFn = (iter: BlinkIteratorRef) => LCG

type ExportedFunctions = {
  find_seed_by_blink: SearchFn
  new_array_builder: NewBuilderFn
  add_value: AddValueFn
  blink_iter_new: NewBlinkIteratorFn
  blink_iter_next: BlinkIteratorNextFn
  blink_iter_get_interval: BlinkIteratorGetIntervalFn
  blink_iter_get_seed: BlinkIteratorGetSeedFn
}

type Callbacks = {
  find_seed: (...args: OnFoundSeedCallbackFnArgs) => void
}

export type BlinkIterator = {
  next(): void
  getState(): [LCG, number]
}

export type LoadWASMReturn = Promise<{
  searchSeedByBlink: (
    seed: LCG,
    framesRange: [min: number, max: number],
    blink: {
      cooltime: number
      tolerance: number
    },
    input: number[],
  ) => LCG[]
  BlinkIterator: (seed: LCG, cooltime: number) => BlinkIterator
}>
export const loadWASM = async (): LoadWASMReturn => {
  const delegates: Callbacks = {
    find_seed: () => {
      console.warn('コールバック関数が設定される前にWASM関数が呼び出されました')
    },
  }

  const { instance } = await WebAssembly.instantiateStreaming(fetch(wasm), {
    // moonbitのprintlnを受けるためにデフォルトで要求される
    spectest: {
      print_char: () => {},
    },
    callback: {
      find_seed: (...args) => {
        delegates.find_seed(...args)
      },
    } satisfies Callbacks,
  })

  const {
    add_value,
    find_seed_by_blink,
    new_array_builder,
    blink_iter_new,
    blink_iter_next,
    blink_iter_get_seed,
    blink_iter_get_interval,
  } = instance.exports as ExportedFunctions

  const searchSeedByBlink = (
    seed: LCG,
    framesRange: [min: number, max: number],
    blink: {
      cooltime: number
      tolerance: number
    },
    input: number[],
  ) => {
    const builder = new_array_builder(input.length)
    for (const value of input) {
      add_value(builder, value)
    }

    const results: LCG[] = []
    delegates.find_seed = (seed) => {
      results.push((seed >>> 0) as LCG)
    }

    find_seed_by_blink(seed, framesRange[0], framesRange[1], blink.cooltime, blink.tolerance, builder)

    return results
  }

  const BlinkIterator = (seed: LCG, cooltime: number): BlinkIterator => {
    const iterRef = blink_iter_new(seed, cooltime)

    return {
      next() {
        blink_iter_next(iterRef)
      },
      getState() {
        return [blink_iter_get_seed(iterRef), blink_iter_get_interval(iterRef)]
      },
    }
  }

  return { searchSeedByBlink, BlinkIterator }
}
