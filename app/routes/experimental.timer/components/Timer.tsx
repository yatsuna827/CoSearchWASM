import { useCallback, useRef, useState } from 'react'

import { LabeledInput } from '@/components/LabeledInput'
import { LCG } from '@/domain/gc/lcg'
import { useSeedInput } from '@/hooks/useSeedInput'
import type { CascadeTimer } from '@/lib/timer/cascadeTimer'

import { useWASM } from '../wasm/Context'
import type { BlinkIterator } from '../wasm/loadWASM'
import { useTimer } from './Timer.hook'

const to60fps = (ms: number) => Math.floor((ms / 1000) * 60)
const from60fps = (frames: number) => Math.ceil((frames * 1000) / 60)

export const Timer: React.FC<{ baseTimestamp: number }> = ({ baseTimestamp }) => {
  const [seed, seedInputController] = useSeedInput('0')

  const { BlinkIterator } = useWASM()
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

    const iter = BlinkIterator(LCG.from(seed), 8)
    iterRef.current = iter

    const lapDurations: number[] = []
    for (let i = 0; i < 20; i++) {
      iter.next()
      const [, interval] = iter.getState()
      lapDurations.push(from60fps(interval))
    }
    onStart(lapDurations, baseTimestamp)
  }, [seed, onStart, BlinkIterator, baseTimestamp])

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
