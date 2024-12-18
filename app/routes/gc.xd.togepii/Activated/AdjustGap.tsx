import { useRef, useState } from 'react'

import { LabeledInput } from '@/components/LabeledInput'
import type { IVs } from '@/domain/gc/generators'
import { useSeedInput } from '@/hooks/useSeedInput'

import { generateTogepii } from '../domain/generateTogepii'
import { useWASM } from '../wasm/Context'

type Stats = [number, number, number, number, number, number]
type SearchGapResult = {
  i: number
  stats: Stats
  ivs: IVs
}

export const AdjustGapSection = () => {
  const wasmReturn = useWASM()

  const [searchGapSeed, searchGapSeedController] = useSeedInput('')
  const gapTargetFramesInputRef = useRef<HTMLInputElement>(null)
  const [gapResult, setGapResult] = useState<SearchGapResult[]>([])
  const handleList = async (e: React.FormEvent) => {
    e.preventDefault()

    if (searchGapSeed == null) return
    if (!gapTargetFramesInputRef.current) return

    const targetFrame = Number(gapTargetFramesInputRef.current.value)
    if (!Number.isInteger(targetFrame) || targetFrame <= 0) return

    const { iterSmoke } = await wasmReturn
    const res = iterSmoke(searchGapSeed, targetFrame + 51)
      .slice(Math.max(0, targetFrame - 50))
      .map(({ i, seed }) => {
        const { stats, ivs } = generateTogepii(seed)
        return {
          i: i - targetFrame,
          stats,
          ivs,
        }
      })

    setGapResult(res)
  }

  return (
    <section>
      <h2 className="font-bold">ずれ確認</h2>

      <form onSubmit={handleList}>
        <LabeledInput
          className="px-2 mb-4"
          label="瞬き後のseed"
          placeholder="1234ABCD"
          {...searchGapSeedController}
        />

        <LabeledInput
          ref={gapTargetFramesInputRef}
          className="px-2"
          label="不定消費 待機時間"
          type="number"
        />

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
    .map(({ i, stats, ivs }) => {
      return `${i}F ${ivs.map((_) => _.toString().padStart(2, '0')).join('-')} (${stats.join('-')})`
    })
    .join('\n')
}
