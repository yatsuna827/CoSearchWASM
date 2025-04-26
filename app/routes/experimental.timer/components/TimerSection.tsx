import { useCallback, useRef, useState } from 'react'

import { LabeledInput } from '@/components/LabeledInput'
import { LCG } from '@/domain/gc/lcg'
import { useSeedInput } from '@/hooks/useSeedInput'

import { runCascadeTimer } from '@/lib/timer/cascadeTimer'
import { optimizedAsyncTimer } from '@/lib/timer/optimizedAsyncTimer'
import { useWASM } from '../wasm/Context'
import { Timer } from './Timer'
import { TimerControl } from './TimerControl'

const to60fps = (ms: number) => Math.floor((ms / 1000) * 60)
const from60fps = (frames: number) => Math.ceil((frames * 1000) / 60)

// タイマーに表示するのは全体の残り時間になってないといけない

export const TimerSection: React.FC<{ baseTimestamp: number }> = ({ baseTimestamp }) => {
  const [seed, seedInputController] = useSeedInput('0')

  const { BlinkIterator } = useWASM()

  const [yotei, setYotei] = useState<number[]>([])
  const [offset, setOffset] = useState(0)
  const offsetRef = useRef<number>(0)

  const [running, setRunning] = useState(false)
  const abortRef = useRef<(() => void) | null>(null)
  const [value, setValue] = useState(0)
  const [timerRemain, setTimerRemain] = useState(0)
  const [isInCountdown, setIsInCountdown] = useState(false)
  const handleStart = useCallback(async () => {
    if (seed == null) return

    setRunning(true)
    const iter = BlinkIterator(LCG.from(seed), 8)

    const lapDurations: number[] = []
    for (let i = 0; i < 20; i++) {
      iter.next()
      const [, interval] = iter.getState()
      lapDurations.push(from60fps(interval))
    }

    const { run, abort } = optimizedAsyncTimer()
    abortRef.current = abort

    const baseTimestamp = performance.now() - 20_000 // 10秒前から開始してたことにする
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
            nextSound -= 1000
          }
          setValue(nextSound + 1000)

          setIsInCountdown(true)
        } else {
          setValue(+currentLapRemain)
        }
        setTimerRemain(totalRemain)
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

    setRunning(false)
    abortRef.current = null
  }, [seed, BlinkIterator])

  return (
    <>
      <LabeledInput
        className="px-2 mb-4"
        label="seed"
        placeholder="1234ABCD"
        {...seedInputController}
      />

      <div className="grid place-content-center h-60">
        <Timer progress={isInCountdown ? value / 2_000 : to60fps(value) / 188}>
          <span className="w-48">{(timerRemain / 1000).toFixed(2)}</span>
        </Timer>
      </div>
      <div>{yotei.join(' , ')}</div>

      <div className="mt-4">オフセット {offset}F</div>

      <TimerControl
        isActive={running}
        onStart={handleStart}
        onCancel={() => {
          setRunning(false)
          abortRef.current?.()
        }}
        onRewind={(f) => {
          setOffset(offset - f)
          offsetRef.current = offset - f
        }}
        onFastForward={(f) => {
          setOffset(offset + f)
          offsetRef.current = offset + f
        }}
      />
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
