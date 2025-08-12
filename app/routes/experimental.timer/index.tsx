import { Suspense, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Container } from '@/components/Container'
import { LabeledInput } from '@/components/LabeledInput'
import { LCG } from '@/domain/gc/lcg'
import { useSeedInput } from '@/hooks/useSeedInput'

import { LoadingCircle } from '@/components/LoadingCircle'
import { BlinkRecorder } from './components/BlinkRecorder'
import { useBlinkRecorder } from './components/BlinkRecorder.hook'
import { TimerSection } from './components/TimerSection'
import { findSeedByBlink } from '@/lib/wasmApi'
import { WASMProvider } from './wasm/Context'

type Input = {
  searchMin: number
  searchMax: number
  cooltime: number
  tolerance: number
}

const Index: React.FC = () => {
  const [seed, seedInputController] = useSeedInput('')
  const { register, getValues } = useForm<Input>()

  const [result, setResult] = useState<{
    seed: LCG
    candidates: LCG[]
    timestamp: number
    history: number[]
  } | null>(null)

  const handleSearch = useCallback(
    async (history: number[], timestamp: number) => {
      const { searchMin, searchMax, cooltime, tolerance } = getValues()
      if (seed == null) return

      // Service Worker経由でfindSeedByBlinkを呼び出し
      const results = await findSeedByBlink(seed, [searchMin, searchMax], { cooltime, tolerance }, history)
      const candidates = results.map((item) => item.seed)
      setResult({ seed, candidates, history, timestamp })
    },
    [seed, getValues],
  )

  const { isFull, progress, onRecord, onReset, onGaugeTransitionEnd } = useBlinkRecorder(handleSearch)

  return (
    <Container>
      <div className="font-[system-ui,sans-serif] leading-8 h-full">
        <div>
          <LabeledInput className="px-2 mb-4" label="seed" placeholder="1234ABCD" {...seedInputController} />
          <div className="flex gap-4 mb-4 max-sm:flex-col">
            <LabeledInput
              className="px-2"
              label="検索範囲(下限)"
              type="number"
              defaultValue={0}
              {...register('searchMin', { valueAsNumber: true })}
            />
            <LabeledInput
              className="px-2"
              label="検索範囲(上限)"
              type="number"
              defaultValue={100000}
              {...register('searchMax', { valueAsNumber: true })}
            />
          </div>

          <div className="flex gap-4 mb-4 max-sm:flex-col">
            <LabeledInput
              className="px-2"
              label="瞬き間隔"
              type="number"
              defaultValue={8}
              min={4}
              max={20}
              {...register('cooltime', { valueAsNumber: true, min: 4, max: 20 })}
            />
            <LabeledInput
              className="px-2"
              label="許容誤差"
              type="number"
              defaultValue={20}
              min={0}
              max={40}
              {...register('tolerance', { valueAsNumber: true, min: 0, max: 40 })}
            />
          </div>
          {/* <LabeledInput
          className="px-2"
          label="入力回数"
          type="number"
          defaultValue={5}
          min={1}
          max={20}
        /> */}
        </div>
        <div className="w-full grid place-items-center">
          <BlinkRecorder
            isFull={isFull}
            progress={progress}
            onRecord={onRecord}
            onGaugeTransitionEnd={onGaugeTransitionEnd}
          />
        </div>

        <button type="button" className="border border-black px-4 py-1 rounded mb-8" onClick={onReset}>
          Reset
        </button>

        <div>
          {result && (
            <>
              <div>入力: {result.history.join(',')}</div>
              <div>たいむすたんぷ: {result.timestamp}</div>
              <div>結果: {result.candidates.length} 件</div>
              <div>
                {result.candidates.map((s) => `${LCG.stringify(s)} (${LCG.getIndex(s, result.seed)}[F])`).join('\n')}
              </div>
            </>
          )}
        </div>

        <div className="mt-10">
          おまけ
          <TimerSection baseTimestamp={result?.timestamp ?? 0} />
        </div>
      </div>
    </Container>
  )
}

// eslint-disable-next-line react/display-name
export default () => (
  <WASMProvider>
    <Suspense
      fallback={
        <LoadingCircle.Container className="h-full">
          <LoadingCircle.Spinner />
        </LoadingCircle.Container>
      }
    >
      <Index />
    </Suspense>
  </WASMProvider>
)
