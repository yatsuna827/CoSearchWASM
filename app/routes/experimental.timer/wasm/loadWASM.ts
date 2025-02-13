import type { LCG } from '@/domain/gc/lcg'
import wasm from '@/wasm/xd-blink.wasm?url'

type WasmExternRef = Branded<unknown, 'WASMExternRef'>
type ArrayBuilder = Branded<WasmExternRef, 'ArrayBuilder'>

type OnFoundSeedCallbackFnArgs = [seed: number]

type SearchFn = (
  current: number,
  min: number,
  max: number,
  coolTime: number,
  tolerance: number,
  input: ArrayBuilder,
) => void
type NewBuilderFn = (length: number) => ArrayBuilder
type AddValueFn = (builder: ArrayBuilder, value: number) => void

type ExportedFunctions = {
  find_seed_by_blink: SearchFn
  new_array_builder: NewBuilderFn
  add_value: AddValueFn
}

type Callbacks = {
  find_seed: (...args: OnFoundSeedCallbackFnArgs) => void
}

export type LoadWASMReturn = Promise<{
  searchSeedByBlink: (
    seed: number,
    framesRange: [min: number, max: number],
    blink: {
      cooltime: number
      tolerance: number
    },
    input: number[],
  ) => LCG[]
}>
export const loadWASM = async (): LoadWASMReturn => {
  const delegates: Callbacks = {
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
      find_seed: (...args) => {
        delegates.find_seed(...args)
      },
    } satisfies Callbacks,
  }

  const { add_value, find_seed_by_blink, new_array_builder } =
    await WebAssembly.instantiateStreaming(fetch(wasm), importObject).then(
      (_) => _.instance.exports as ExportedFunctions,
    )

  const searchSeedByBlink = (
    seed: number,
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

    find_seed_by_blink(
      seed,
      framesRange[0],
      framesRange[1],
      blink.cooltime,
      blink.tolerance,
      builder,
    )

    return results
  }

  return { searchSeedByBlink }
}
