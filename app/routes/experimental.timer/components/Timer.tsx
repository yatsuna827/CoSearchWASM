import { useCallback, useRef, useState } from 'react'

import { LabeledInput } from '@/components/LabeledInput'
import { LCG } from '@/domain/gc/lcg'
import { useSeedInput } from '@/hooks/useSeedInput'

import { cn } from '@/cn'
import { runCascadeTimer } from '@/lib/timer/cascadeTimer'
import { optimizedAsyncTimer } from '@/lib/timer/optimizedAsyncTimer'
import { useWASM } from '../wasm/Context'

const to60fps = (ms: number) => Math.floor((ms / 1000) * 60)
const from60fps = (frames: number) => Math.ceil((frames * 1000) / 60)

export const Timer: React.FC<{ baseTimestamp: number }> = ({ baseTimestamp }) => {
  const [seed, seedInputController] = useSeedInput('0')

  const { BlinkIterator } = useWASM()

  const [yotei, setYotei] = useState<number[]>([])
  const [offset, setOffset] = useState(0)
  const offsetRef = useRef<number>(0)

  const abortRef = useRef<(() => void) | null>(null)
  const [value, setValue] = useState(0)
  const [isInCountdown, setIsInCountdown] = useState(false)
  const handleStart = useCallback(async () => {
    if (seed == null) return

    const iter = BlinkIterator(LCG.from(seed), 8)

    const lapDurations: number[] = []
    for (let i = 0; i < 20; i++) {
      iter.next()
      const [, interval] = iter.getState()
      lapDurations.push(from60fps(interval))
    }

    const { run, abort } = optimizedAsyncTimer()
    abortRef.current = abort

    // const baseTimestamp = performance.now() - 20_000 // 10秒前から開始してたことにする
    setIsInCountdown(false)
    setYotei(lapDurations.slice(0, 10).map(to60fps))

    let nextSound = 2_000
    await runCascadeTimer(run, {
      lapDurations,
      getElapsed(timestamp) {
        return timestamp - baseTimestamp + offsetRef.current
      },
      onUpdate(currentLapRemain, totalRemain) {
        if (totalRemain < 2_000) {
          if (totalRemain < nextSound) {
            sound()
            nextSound -= 500
          }
          setValue(nextSound + 500)

          setIsInCountdown(true)
        } else {
          setValue(currentLapRemain)
        }
      },
      onShift(lapIndex) {
        setYotei(lapDurations.slice(lapIndex, lapIndex + 10).map(to60fps))

        const isInCountdown = nextSound < 2000
        if (!isInCountdown) {
          sound(0.75)
        }

        // iter.next()
        // const [, interval] = iter.getState()
        // lapDurations.push(from60fps(interval))
      },
      onComplete() {
        setValue(0)
        abort()
      },
    }).catch(() => abort())

    abortRef.current = null
  }, [seed, BlinkIterator, baseTimestamp])

  return (
    <>
      <LabeledInput
        className="px-2 mb-4"
        label="seed"
        placeholder="1234ABCD"
        {...seedInputController}
      />
      <div className="h-14 w-[500px] border border-black relative box-content">
        <div
          className={cn('h-14 bg-blue-400 absolute left-0', isInCountdown && 'bg-red-500')}
          style={{
            width: isInCountdown ? (500 * value) / 2_000 : (500 * to60fps(value)) / 188,
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
        onClick={() => abortRef.current?.()}
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
            offsetRef.current = offset - 10
          }}
        >
          -10
        </button>
        <button
          type="button"
          className="w-24 h-8 text-sm border font-semibold bg-white disabled:bg-gray-200 disabled:text-gray-400"
          onClick={() => {
            setOffset(offset - 1)
            offsetRef.current = offset - 1
          }}
        >
          -1
        </button>
        <button
          type="button"
          className="w-24 h-8 text-sm border font-semibold bg-white disabled:bg-gray-200 disabled:text-gray-400"
          onClick={() => {
            setOffset(0)
            offsetRef.current = 0
          }}
        >
          RESET
        </button>
        <button
          type="button"
          className="w-24 h-8 text-sm border font-semibold bg-white disabled:bg-gray-200 disabled:text-gray-400"
          onClick={() => {
            setOffset(offset + 1)
            offsetRef.current = offset + 1
          }}
        >
          +1
        </button>
        <button
          type="button"
          className="w-24 h-8 text-sm border font-semibold bg-white disabled:bg-gray-200 disabled:text-gray-400"
          onClick={() => {
            setOffset(offset + 10)
            offsetRef.current = offset + 10
          }}
        >
          +10
        </button>
      </div>
    </>
  )
}

const sound = (f = 1) => {
  const ctx = new AudioContext()
  const node = new OscillatorNode(ctx, {
    frequency: 880 * f,
    type: 'square',
  })
  node.connect(ctx.destination)

  node.start()
  node.stop(0.1)
}
