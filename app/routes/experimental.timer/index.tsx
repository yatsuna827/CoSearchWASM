import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Container } from '@/components/Container'
import { LabeledInput } from '@/components/LabeledInput'
import { PokeBall } from '@/components/PokeBall'
import { LCG } from '@/domain/gc/lcg'
import { useSeedInput } from '@/hooks/useSeedInput'
import { CascadeTimer, type CascadeTimerState } from '@/lib/timer/cascadeTimer'

import { WASMProvider, useWASM } from './wasm/Context'
import type { BlinkIterator } from './wasm/loadWASM'

type Input = {
  searchMin: number
  searchMax: number
  cooltime: number
  tolerance: number
}

const to60fps = (ms: number) => Math.floor((ms / 1000) * 60)
const from60fps = (frames: number) => Math.ceil((frames * 1000) / 60)

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

type UseTimerArgs = {
  onTick?: (timer: CascadeTimer) => void
  onLapNext?: (timer: CascadeTimer) => void
}
const useTimer = ({ onTick, onLapNext }: UseTimerArgs) => {
  const timerRef = useRef<CascadeTimer>(new CascadeTimer())

  useEffect(() => {
    const timer = timerRef.current

    const unsubscribe = timer.addEventListener('next-lap', () => {
      onLapNext?.(timer)
    })

    return () => {
      unsubscribe()
    }
  }, [onLapNext])
  useEffect(() => {
    const timer = timerRef.current

    const unsubscribe = timerRef.current.addEventListener('tick', () => {
      onTick?.(timer)
    })

    return () => {
      unsubscribe()
    }
  }, [onTick])

  useEffect(() => {
    return () => {
      timerRef.current.cancel()
    }
  }, [])

  const onStart = useCallback((lap: number[]) => {
    timerRef.current?.start(lap)
  }, [])
  const onStop = useCallback(() => {
    timerRef.current?.reset()
  }, [])
  const onSetOffset = useCallback((value: number) => {
    timerRef.current?.setOffset(from60fps(value))
  }, [])

  return {
    onStart,
    onStop,
    onSetOffset,
  }
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
  const [seed, seedInputController] = useSeedInput('0')

  const wasmReturn = useWASM()
  const iterRef = useRef<BlinkIterator | null>(null)

  const [yotei, setYotei] = useState<number[]>([])
  const [value, setValue] = useState(0)
  const [offset, setOffset] = useState(0)
  const onTick = useCallback((timer: CascadeTimer) => {
    const timerState = timer.getState()
    setValue(timerState.status === 'countdowning' ? timerState.lapRemain : 0)
  }, [])
  const onLapNext = useCallback((timer: CascadeTimer) => {
    const timerState = timer.getState()
    setYotei(
      timerState.status === 'countdowning'
        ? timerState.lapDurationsRemain.slice(0, 10).map(to60fps)
        : [],
    )
    if (timerState.status === 'countdowning' && timerState.lapDurationsRemain.length < 20) {
      if (iterRef.current) {
        iterRef.current.next()
        const [, interval] = iterRef.current.getState()
        timer.addLap(from60fps(interval))
      }
    }
  }, [])

  const { onStart, onStop, onSetOffset } = useTimer({ onTick, onLapNext })
  const handleStart = useCallback(async () => {
    if (seed == null) return

    const { BlinkIterator } = await wasmReturn

    const iter = BlinkIterator(LCG.from(seed), 8)
    iterRef.current = iter

    const lapDurations: number[] = []
    for (let i = 0; i < 20; i++) {
      iter.next()
      const [, interval] = iter.getState()
      lapDurations.push(from60fps(interval))
    }
    onStart(lapDurations)
  }, [seed, onStart, wasmReturn])

  return (
    <>
      <LabeledInput
        className="px-2 mb-4"
        label="seed"
        placeholder="1234ABCD"
        {...seedInputController}
      />
      <div className="h-10 w-[300px] border border-black relative box-content">
        <div
          className="h-10 bg-blue-400 absolute left-0"
          style={{
            width: (300 * to60fps(value)) / 188,
          }}
        />
      </div>
      <div>{(value / 1000).toFixed(2)}sec</div>
      <div>{yotei.join(' , ')}</div>
      <button
        type="button"
        className="w-24 h-8 text-sm border font-semibold bg-white disabled:bg-gray-200 disabled:text-gray-400"
        onClick={handleStart}
      >
        START
      </button>
      <button
        type="button"
        className="w-24 h-8 text-sm border font-semibold bg-white disabled:bg-gray-200 disabled:text-gray-400"
        onClick={onStop}
      >
        STOP
      </button>

      <div className="mt-4">オフセット {offset}F</div>
      <div className="flex gap-2">
        <button
          type="button"
          className="w-24 h-8 text-sm border font-semibold bg-white disabled:bg-gray-200 disabled:text-gray-400"
          onClick={() => {
            setOffset(offset - 10)
            onSetOffset(offset - 10)
          }}
        >
          -10
        </button>
        <button
          type="button"
          className="w-24 h-8 text-sm border font-semibold bg-white disabled:bg-gray-200 disabled:text-gray-400"
          onClick={() => {
            setOffset(offset - 1)
            onSetOffset(offset - 1)
          }}
        >
          -1
        </button>
        <button
          type="button"
          className="w-24 h-8 text-sm border font-semibold bg-white disabled:bg-gray-200 disabled:text-gray-400"
          onClick={() => {
            setOffset(0)
            onSetOffset(0)
          }}
        >
          RESET
        </button>
        <button
          type="button"
          className="w-24 h-8 text-sm border font-semibold bg-white disabled:bg-gray-200 disabled:text-gray-400"
          onClick={() => {
            setOffset(offset + 1)
            onSetOffset(offset + 1)
          }}
        >
          +1
        </button>
        <button
          type="button"
          className="w-24 h-8 text-sm border font-semibold bg-white disabled:bg-gray-200 disabled:text-gray-400"
          onClick={() => {
            setOffset(offset + 10)
            onSetOffset(offset + 10)
          }}
        >
          +10
        </button>
      </div>
    </>
  )
}

export default () => (
  <WASMProvider>
    <Index />
  </WASMProvider>
)
