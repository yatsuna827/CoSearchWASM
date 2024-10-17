import { LCG } from '@/domain/gc/lcg'
import {
  advanceInNamingScreen,
  backInNamingScreen,
  isValidSeed,
} from '@/domain/gc/starter/namingScreen'
import { type GenerateStarterResult, generateStarter } from '@/domain/gc/starter/starterGenerator'
import { Ref } from '@/utilities/ref'
import type { MetaFunction } from '@remix-run/node'
import { type ComponentProps, forwardRef, useId, useMemo, useState } from 'react'

export const meta: MetaFunction = () => {
  return [
    { title: 'Pokemon XD Starter RNG Tool' },
    { name: 'description', content: 'ポケモンXDのID・イーブイ乱数調整用のツールです。' },
  ]
}

type LabeledInputProps = ComponentProps<'input'> & { label: string }
const LabeledInput = forwardRef<HTMLInputElement, LabeledInputProps>(({ label, ...props }, ref) => {
  const id = useId()

  return (
    <div>
      <label htmlFor={id} className="block">
        {label}
      </label>
      <input {...props} ref={ref} id={id} />
    </div>
  )
})

const ResultBlock: React.FC<{ seed: LCG }> = ({ seed }) => {
  const { tid, sid, eevee } = useMemo(() => {
    return generateStarter(seed)
  }, [seed])

  const isValid = isValidSeed(seed)

  return (
    <div className={isValid ? 'text-black' : 'text-gray-400'}>
      <span>{tid.toString().padStart(5, '0')}</span>/<span>{sid.toString().padStart(5, '0')}</span>
      <div>{eevee.ivs.map((_) => _.toString().padStart(2, '0')).join('-')}</div>
      <div>{eevee.pid.toString(16).toUpperCase().padStart(8, '0')}</div>
      {!isValid && <span className="text-red-600 font-semibold">到達不可能なseedです</span>}
    </div>
  )
}

const Page: React.FC = () => {
  const [seedRaw, setSeedRaw] = useState<string>('E9556E66')
  const [timerFrames, setTimerFrames] = useState(1000)
  const [blankFrames, setBlankFrames] = useState(585)

  const [currentSeedRaw, setCurrentSeedRaw] = useState<string>('BEEFBEEF')

  const seed = useMemo(() => {
    return seedRaw != null ? LCG.tryParse(seedRaw) : null
  }, [seedRaw])

  const currentSeed = useMemo(() => {
    return currentSeedRaw != null ? LCG.tryParse(currentSeedRaw) : null
  }, [currentSeedRaw])

  const namingStart = useMemo(() => {
    if (seed == null || currentSeed == null) return null

    return backInNamingScreen(seed, timerFrames + blankFrames)
  }, [seed, currentSeed, timerFrames, blankFrames])

  const nokoriShouhi = useMemo(() => {
    if (namingStart == null || currentSeed == null) return null

    return LCG.getIndex(namingStart, currentSeed)
  }, [namingStart, currentSeed])

  const searchResult = useMemo(() => {
    if (seed == null) return []

    const start = backInNamingScreen(seed, 100)

    const lcg = Ref.from(start)
    const result: [number, GenerateStarterResult][] = []
    for (let i = -100; i <= 100; i++) {
      result.push([i, lcg.map(generateStarter)])

      lcg.update(advanceInNamingScreen)
    }

    return result
  }, [seed])

  return (
    <div className="font-[system-ui,sans-serif] leading-8 flex h-full">
      <div className="bg-stone-200 p-5 w-[300px] h-full min-h-[600px] space-y-4 overflow-y-scroll">
        <LabeledInput
          value={seedRaw}
          onChange={(e) => setSeedRaw(e.target.value)}
          className="px-2"
          label="目標seed"
          placeholder="1234ABCD"
        />

        <LabeledInput
          value={timerFrames}
          onChange={(e) => setTimerFrames(Number.parseInt(e.target.value))}
          type="number"
          min={0}
          step={1}
          className="px-2"
          label="タイマー（F）"
        />

        <LabeledInput
          value={blankFrames}
          onChange={(e) => setBlankFrames(Number.parseInt(e.target.value))}
          type="number"
          min={0}
          step={1}
          className="px-2"
          label="制動時間（F）"
        />

        <hr />

        <LabeledInput
          value={currentSeedRaw}
          onChange={(e) => setCurrentSeedRaw(e.target.value)}
          className="px-2"
          label="現在のseed"
          placeholder="1234ABCD"
        />
      </div>
      <div className="flex-auto overflow-x-hidden overflow-y-scroll px-1 bg-[#f9f9f9]">
        <div className="w-full overflow-x-auto">
          {seed ? <ResultBlock seed={seed} /> : <div>seedの入力が不正です＞＜</div>}
          {nokoriShouhi != null ? <div>残り {nokoriShouhi >>> 0} 消費必要です</div> : <></>}

          <div className="mt-4">
            {namingStart && (
              <>
                <div>
                  <span>
                    突入時のseed {namingStart.toString(16).padStart(8, '0').toUpperCase()}
                  </span>
                </div>
                <div>検索範囲 ±100</div>
                <div className="h-[200px] border overflow-y-scroll">
                  {searchResult.map(([i, { tid, sid, eevee }]) => (
                    <div key={i} className="flex gap-2">
                      <div>{i}</div>
                      <div>{tid.toString().padStart(5, '0')}</div>
                      <div>{sid.toString().padStart(5, '0')}</div>
                      <div>{eevee.ivs.map((_) => _.toString().padStart(2, '0')).join('-')}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
