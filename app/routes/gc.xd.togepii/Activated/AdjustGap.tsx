import { useRef, useState } from 'react'

import { LabeledInput } from '@/components/LabeledInput'
import type { IVs } from '@/domain/gc/generators'
import { useSeedInput } from '@/hooks/useSeedInput'

import { LCG, next, prev } from '@/domain/gc/lcg'
import { Ref } from '@/utilities/ref'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { generateTogepii } from '../domain/generateTogepii'
import { iterSmoke } from '@/lib/wasmApi'

type Stats = [number, number, number, number, number, number]
type SearchGapResult = {
  i: number
  blinkGap: number
  stats: Stats
  ivs: IVs
}

type Input = {
  h: number
  a: number
  b: number
  c: number
  d: number
  s: number

  blinkErrorRange: number
}

export const AdjustGapSection = () => {
  const { register, handleSubmit } = useForm<Input>()

  const [searchGapSeed, searchGapSeedController] = useSeedInput('')
  const gapTargetFramesInputRef = useRef<HTMLInputElement>(null)
  const [gapResult, setGapResult] = useState<SearchGapResult[]>([])
  const handleList: SubmitHandler<Input> = async (data) => {
    if (searchGapSeed == null) return
    if (!gapTargetFramesInputRef.current) return

    const targetFrame = Number(gapTargetFramesInputRef.current.value)
    if (!Number.isInteger(targetFrame) || targetFrame <= 0) return

    const lcg = Ref.from(searchGapSeed)
    lcg.update((s) => prev(s, data.blinkErrorRange))

    const result: SearchGapResult[] = []
    for (let gap = -data.blinkErrorRange; gap <= data.blinkErrorRange; gap++) {
      const smokeResults = await iterSmoke(lcg.unwrap(), targetFrame + 51)
      const res = smokeResults
        .slice(Math.max(0, targetFrame - 50))
        .map(({ i, seed }) => {
          const { stats, ivs } = generateTogepii(seed)
          return {
            i: i - targetFrame,
            blinkGap: gap,
            stats,
            ivs,
          }
        })
        .filter(({ stats }) => {
          if (Number.isInteger(data.h) && stats[0] !== data.h) return false
          if (Number.isInteger(data.a) && stats[1] !== data.a) return false
          if (Number.isInteger(data.b) && stats[2] !== data.b) return false
          if (Number.isInteger(data.c) && stats[3] !== data.c) return false
          if (Number.isInteger(data.d) && stats[4] !== data.d) return false
          if (Number.isInteger(data.s) && stats[5] !== data.s) return false

          return true
        })

      result.push(...res)
      lcg.update(next)
    }

    setGapResult(result)
  }

  return (
    <section className="my-4">
      <form onSubmit={handleSubmit(handleList)}>
        <div className="flex gap-2 items-end mb-4">
          <div>
            <label>
              <span className="block text-sm text-[#333]/80 mb-1 select-none">瞬き後のseed</span>
              <input className="px-2" placeholder="1234ABCD" {...searchGapSeedController} />
            </label>
          </div>
          <span>±</span>
          <div>
            <input
              className="px-2"
              type="number"
              defaultValue={0}
              min={0}
              max={10}
              {...register('blinkErrorRange', { valueAsNumber: true, min: 0, max: 10 })}
            />
          </div>
          <span>F</span>
        </div>

        <LabeledInput
          ref={gapTargetFramesInputRef}
          className="px-2 mb-4"
          label="不定消費 待機時間"
          type="number"
        />

        <div className="flex [&_input]:w-16 [&_input]:pl-2 gap-4 items-end">
          <input type="number" {...register('h', { valueAsNumber: true })} />
          <input type="number" {...register('a', { valueAsNumber: true })} />
          <input type="number" {...register('b', { valueAsNumber: true })} />
          <input type="number" {...register('c', { valueAsNumber: true })} />
          <input type="number" {...register('d', { valueAsNumber: true })} />
          <input type="number" {...register('s', { valueAsNumber: true })} />
        </div>

        <button
          type="submit"
          className="my-4 w-24 h-8 text-sm border font-semibold text-[#333] bg-white disabled:bg-gray-200 disabled:text-gray-400"
        >
          計算
        </button>
      </form>

      <textarea
        className="min-w-full min-h-64 block px-4 py-2"
        readOnly
        value={formatResult(gapResult)}
      />
    </section>
  )
}

const formatResult = (results: SearchGapResult[]) => {
  return results
    .map(({ i, blinkGap, stats, ivs }) => {
      return `${i > 0 ? '+' : ''}${i}F (blink: ${blinkGap}F) ${ivs
        .map((_) => _.toString().padStart(2, '0'))
        .join('-')} (${stats.join('-')})`
    })
    .join('\n')
}
