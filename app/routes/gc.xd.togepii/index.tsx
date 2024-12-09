import { Container } from '@/components/Container'
import { LabeledInput } from '@/components/LabeledInput'
import { type IVs, generateIndividual } from '@/domain/gc/generators'
import { LCG } from '@/domain/gc/lcg'
import { natures, toJapanese } from '@/domain/nature'
import { toStats } from '@/domain/stats'
import { useSeedInput } from '@/hooks/useSeedInput'
import type { MetaFunction } from '@remix-run/node'
import { useRef, useState } from 'react'
import { loadWASM } from './loadWASM'

export const meta: MetaFunction = () => {
  return [
    { title: 'Pokemon XD Togepii RNG Tool' },
    { name: 'description', content: 'ポケモンXDのトゲピー乱数調整用のツールです。' },
  ]
}

type SearchGapResult = {
  i: number
  stats: [number, number, number, number, number, number]
  ivs: IVs
}

const generateTogepii = (seed: LCG) => {
  const ind = generateIndividual(seed)[0]
  const nature = natures[ind.pid % 25]

  return { ...ind, stats: toStats([35, 20, 65, 40, 65, 20], ind.ivs, 25, nature), nature }
}

const formatResult = (results: [number, LCG, number, LCG][]) => {
  return results
    .map(
      ([f_b, s_b, f_s, s_s]) =>
        `瞬き: ${f_b}F (${LCG.stringify(s_b)}) → 不定消費: ${f_s}F (${LCG.stringify(s_s)})`,
    )
    .join('\n')
}
const formatResult2 = (results: SearchGapResult[]) => {
  return results
    .map(({ i, stats, ivs }) => {
      return `${i}F ${ivs.map((_) => _.toString().padStart(2, '0')).join('-')} (${stats.join('-')})`
    })
    .join('\n')
}

// 19F0033A / 5E967EC0
// 6D3167B2

const Page: React.FC = () => {
  const wasmRef = useRef(loadWASM())

  const [targetSeed, targetSeedController] = useSeedInput('')
  const [currentSeed, currentSeedController] = useSeedInput('')
  const blinkMinInputRef = useRef<HTMLInputElement>(null)
  const blinkMaxInputRef = useRef<HTMLInputElement>(null)
  const smokeMinInputRef = useRef<HTMLInputElement>(null)
  const smokeMaxInputRef = useRef<HTMLInputElement>(null)
  const [result, setResult] = useState<[number, LCG, number, LCG][] | null>(null)
  const handleClick1 = async () => {
    if (targetSeed == null || currentSeed == null) return
    if (!blinkMinInputRef.current) return
    if (!blinkMaxInputRef.current) return
    if (!smokeMinInputRef.current) return
    if (!smokeMaxInputRef.current) return

    const blinkFrames = [
      Number(blinkMinInputRef.current.value),
      Number(blinkMaxInputRef.current.value),
    ] satisfies [number, number]
    const smokeFrames = [
      Number(smokeMinInputRef.current.value),
      Number(smokeMaxInputRef.current.value),
    ] satisfies [number, number]
    if ([...blinkFrames, ...smokeFrames].some((_) => !Number.isInteger(_))) return

    const { searchTogepii } = await wasmRef.current
    const res = searchTogepii(currentSeed, targetSeed, {
      blink: {
        cooltime: 4,
        framesRange: blinkFrames,
        intervalRange: [0, 183],
      },
      smoke: {
        framesRange: smokeFrames,
      },
    })

    setResult(res)
  }

  const individual = targetSeed != null ? generateTogepii(targetSeed) : null

  const [searchGapSeed, searchGapSeedController] = useSeedInput('')
  const gapTargetFramesInputRef = useRef<HTMLInputElement>(null)
  const [gapResult, setGapResult] = useState<
    { i: number; stats: [number, number, number, number, number, number]; ivs: IVs }[]
  >([])
  const handleClick2 = async () => {
    if (searchGapSeed == null) return
    if (!gapTargetFramesInputRef.current) return

    const targetFrame = Number(gapTargetFramesInputRef.current.value)
    if (!Number.isInteger(targetFrame) || targetFrame <= 0) return

    const { iterSmoke } = await wasmRef.current
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
    <>
      <div className="sticky top-0 flex items-center justify-center px-4 h-10 border-b bg-white">
        <h1 className="text-lg font-semibold">PokemonXD トゲピー</h1>
      </div>

      <Container>
        <LabeledInput
          className="px-2"
          label="目標seed"
          placeholder="1234ABCD"
          {...targetSeedController}
        />
        {individual && (
          <div className="px-2">
            <span className="mr-2">{toJapanese(individual.nature)}</span>
            <span className="mr-2">
              {individual.ivs.map((_) => _.toString().padStart(2, '0')).join('-')}
            </span>
            <span className="mr-2">({individual.stats.join('-')})</span>
          </div>
        )}

        <section className="my-4">
          <h2 className="font-bold mb-2">不定消費計算</h2>

          <LabeledInput
            className="px-2 mb-4"
            label="現在のseed"
            placeholder="1234ABCD"
            {...currentSeedController}
          />
          <div className="flex gap-4 mb-2">
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

          <div className="flex gap-4 mb-4">
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
            type="button"
            className="w-24 h-8 text-sm border font-semibold text-[#333] bg-white disabled:bg-gray-200 disabled:text-gray-400"
            onClick={handleClick1}
          >
            計算
          </button>

          <div className="mt-4">
            {result &&
              (result.length ? `${result.length}件見つかりました` : '見つかりませんでした…')}
          </div>

          <textarea
            className="min-w-full min-h-64 block px-4 py-2"
            readOnly
            value={result ? formatResult(result) : ''}
          />
        </section>

        <section>
          <h2 className="font-bold">ずれ確認</h2>

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
            type="button"
            className="my-4 w-24 h-8 text-sm border font-semibold text-[#333] bg-white disabled:bg-gray-200 disabled:text-gray-400"
            onClick={handleClick2}
          >
            計算
          </button>

          <textarea
            className="min-w-full min-h-64 block px-4 py-2"
            readOnly
            value={formatResult2(gapResult)}
          />
        </section>
      </Container>
    </>
  )
}

export default Page
