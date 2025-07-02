import { useRef, useState } from 'react'

import { LabeledInput } from '@/components/LabeledInput'
import { LCG } from '@/domain/gc/lcg'
import { useSeedInput } from '@/hooks/useSeedInput'
import { searchTogepii } from '@/lib/wasmApi'

type Props = {
  targetSeed: LCG
}
export const SearchSection: React.FC<Props> = ({ targetSeed }) => {
  const [currentSeed, currentSeedController] = useSeedInput('')
  const blinkMinInputRef = useRef<HTMLInputElement>(null)
  const blinkMaxInputRef = useRef<HTMLInputElement>(null)
  const smokeMinInputRef = useRef<HTMLInputElement>(null)
  const smokeMaxInputRef = useRef<HTMLInputElement>(null)
  const [result, setResult] = useState<[number, LCG, number, LCG][] | null>(null)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (targetSeed == null || currentSeed == null) return
    if (!blinkMinInputRef.current) return
    if (!blinkMaxInputRef.current) return
    if (!smokeMinInputRef.current) return
    if (!smokeMaxInputRef.current) return

    const blinkFrames = [Number(blinkMinInputRef.current.value), Number(blinkMaxInputRef.current.value)] satisfies [
      number,
      number,
    ]
    const smokeFrames = [Number(smokeMinInputRef.current.value), Number(smokeMaxInputRef.current.value)] satisfies [
      number,
      number,
    ]
    if ([...blinkFrames, ...smokeFrames].some((_) => !Number.isInteger(_))) return

    const res = await searchTogepii(
      currentSeed,
      targetSeed,
      { cooltime: 4 },
      0,
      183,
      blinkFrames[0],
      blinkFrames[1],
      smokeFrames[0],
      smokeFrames[1],
    )

    const formatted = res.map(
      (item) => [item.f_blink, item.seed_blink, item.f_smoke, item.seed_smoke] satisfies [number, LCG, number, LCG],
    )
    setResult(formatted)
  }

  return (
    <section className="my-4">
      <form onSubmit={handleSearch}>
        <LabeledInput className="px-2 mb-4" label="現在のseed" placeholder="1234ABCD" {...currentSeedController} />
        <div className="flex gap-4 mb-4 max-sm:flex-col">
          <LabeledInput
            ref={blinkMinInputRef}
            className="px-2"
            label="瞬き 待機時間 (mix)"
            type="number"
            defaultValue={2000}
          />
          <LabeledInput
            ref={blinkMaxInputRef}
            className="px-2"
            label="瞬き 待機時間 (max)"
            type="number"
            defaultValue={5000}
          />
        </div>

        <div className="flex gap-4 mb-4 max-sm:flex-col">
          <LabeledInput
            ref={smokeMinInputRef}
            className="px-2"
            label="不定消費 待機時間 (mix)"
            type="number"
            defaultValue={300}
          />
          <LabeledInput
            ref={smokeMaxInputRef}
            className="px-2"
            label="不定消費 待機時間 (max)"
            type="number"
            defaultValue={700}
          />
        </div>

        <button
          type="submit"
          className="w-24 h-8 text-sm border font-semibold text-[#333] bg-white disabled:bg-gray-200 disabled:text-gray-400"
        >
          計算
        </button>
      </form>

      <div className="mt-4">
        {result && (result.length ? `${result.length}件見つかりました` : '見つかりませんでした…')}
      </div>

      <textarea className="min-w-full min-h-64 block px-4 py-2" readOnly value={result ? formatResult(result) : ''} />
    </section>
  )
}

const formatResult = (results: [number, LCG, number, LCG][]) => {
  return results
    .map(([f_b, s_b, f_s, s_s]) => `瞬き: ${f_b}F (${LCG.stringify(s_b)}) → 不定消費: ${f_s}F (${LCG.stringify(s_s)})`)
    .join('\n')
}
