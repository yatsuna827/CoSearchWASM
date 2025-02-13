import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Container } from '@/components/Container'
import { LabeledInput } from '@/components/LabeledInput'
import { PokeBall } from '@/components/PokeBall'
import { LCG } from '@/domain/gc/lcg'
import { useSeedInput } from '@/hooks/useSeedInput'
import { CascadeTimer, type CascadeTimerState } from '@/lib/timer/cascadeTimer'

import { WASMProvider, useWASM } from './wasm/Context'

type Input = {
  searchMin: number
  searchMax: number
  cooltime: number
  tolerance: number
}

const to60fps = (ms: number) => Math.floor((ms / 1000) * 60)

const Index: React.FC = () => {
  const [seed, seedInputController] = useSeedInput('')
  const { register, getValues } = useForm<Input>()

  const wasmReturn = useWASM()

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

      const { searchSeedByBlink } = await wasmReturn

      const result = searchSeedByBlink(
        seed,
        [searchMin, searchMax],
        { cooltime, tolerance },
        history,
      )
      setResult({ seed, candidates: result, history, timestamp })
    },
    [seed, wasmReturn, getValues],
  )

  const { isFull, progress, onRecord, onReset, onGaugeTransitionEnd } =
    useBlinkRecorder(handleSearch)

  return (
    <Container>
      <div className="font-[system-ui,sans-serif] leading-8 h-full">
        <div>
          <LabeledInput
            className="px-2 mb-4"
            label="seed"
            placeholder="1234ABCD"
            {...seedInputController}
          />
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

        <button
          type="button"
          className="border border-black px-4 py-1 rounded mb-8"
          onClick={onReset}
        >
          Reset
        </button>

        <div>
          {result && (
            <>
              <div>入力: {result.history.join(',')}</div>
              <div>たいむすたんぷ: {result.timestamp}</div>
              <div>結果: {result.candidates.length} 件</div>
              <div>
                {result.candidates
                  .map((s) => `${LCG.stringify(s)} (${LCG.getIndex(s, result.seed)}[F])`)
                  .join('\n')}
              </div>
            </>
          )}
        </div>

        <div className="mt-10">
          おまけ
          <Timer />
        </div>
      </div>
    </Container>
  )
}

const useTimer = (onTick: (state: CascadeTimerState) => void) => {
  const startRef = useRef<null | (() => void)>(null)
  useEffect(() => {
    const timer = new CascadeTimer([1000, 1000, 1000])
    const unsubscribe = timer.addEventListener('tick', () => {
      onTick(timer.getState())
    })

    startRef.current = (...p) => timer.start(...p)

    return () => {
      unsubscribe()
      timer.reset()
    }
  }, [onTick])

  const start = useCallback(() => {
    startRef.current?.()
  }, [])

  return start
}

const useBlinkRecorder = (onFull: (history: number[], lastBlinked: number) => void) => {
  const [count] = useState(10)
  const [isFull, setIsFull] = useState(false)

  const [prevBlinked, setPrevBlinked] = useState<number | undefined>(undefined)
  const [blinkHistory, setBlinkHistory] = useState<number[]>([])

  const progress = blinkHistory.length < 1 ? 0 : (blinkHistory.length / count) * 100

  const onRecord = useCallback(() => {
    if (blinkHistory.length >= count) return

    const current = performance.now()
    if (prevBlinked) {
      const next = [...blinkHistory, to60fps(current - prevBlinked)]
      setBlinkHistory(next)
    }

    setPrevBlinked(current)
  }, [count, blinkHistory, prevBlinked])
  const onReset = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setBlinkHistory([])
    setPrevBlinked(undefined)
    e.currentTarget.blur()
  }, [])

  // isFullはゲージのアニメーションが完了してから更新したい
  // Transition APIとかでなんとかなるんか…？
  const onGaugeTransitionEnd = useCallback(() => {
    const isFull = progress >= 100
    setIsFull(isFull)
    if (isFull && prevBlinked != null) {
      onFull(blinkHistory, prevBlinked + performance.timeOrigin)
    }
  }, [progress, blinkHistory, prevBlinked, onFull])

  return {
    progress,
    blinkHistory,
    isFull,
    onRecord,
    onReset,
    onGaugeTransitionEnd,
  }
}

type BlinkRecorderProps = {
  isFull: boolean
  progress: number
  onRecord: () => void
  onGaugeTransitionEnd: () => void
}
const BlinkRecorder: React.FC<BlinkRecorderProps> = ({
  isFull,
  progress,
  onRecord,
  onGaugeTransitionEnd,
}) => {
  return (
    <div className="size-52 relative">
      <PokeBall onFire={onRecord} />
      <div className="absolute top-0 size-52 pointer-events-none">
        <svg className="[&>circle]:stroke-[8]" viewBox="0 0 100 100">
          <circle fill="none" stroke="rgba(170,170,170,.3)" cx="50" cy="50" r="45" />
          <circle
            style={{
              transition: 'stroke-dashoffset .5s ease',
              transitionDelay: '.2s',
            }}
            fill="none"
            stroke={isFull ? '#22C55E' : '#00CCFF'}
            cx="50"
            cy="50"
            r="45"
            transform="rotate(-90 50 50)"
            strokeDasharray={Math.PI * 2 * 45}
            strokeDashoffset={(Math.PI * 2 * 45 * (100 - progress)) / 100}
            onTransitionEnd={onGaugeTransitionEnd}
          />
        </svg>
      </div>
    </div>
  )
}

const Timer: React.FC = () => {
  const [value, setValue] = useState(0)
  const onTick = useCallback(({ lapRemain }: CascadeTimerState) => {
    console.log(lapRemain)
    setValue(lapRemain)
  }, [])
  const start = useTimer(onTick)

  return (
    <>
      <div className="h-10 w-[300px] border border-black relative box-content">
        <div
          className="h-10 bg-blue-400 absolute left-0"
          style={{
            width: (300 * value) / 1000,
          }}
        />
      </div>
      <button type="button" onClick={start}>
        START
      </button>
    </>
  )
}

export default () => (
  <WASMProvider>
    <Index />
  </WASMProvider>
)
