import { LCG } from '@/domain/gc/lcg'
import { CascadeTimer, type CascadeTimerState } from '@/lib/timer/cascadeTimer'
import { useCallback, useEffect, useRef, useState } from 'react'
import { WASMProvider, useWASM } from './wasm/Context'

const Index: React.FC = () => {
  const [value, setValue] = useState(0)
  const onTick = useCallback(({ lapRemain }: CascadeTimerState) => {
    console.log(lapRemain)
    setValue(lapRemain)
  }, [])
  const start = useTimer(onTick)

  const wasmReturn = useWASM()

  return (
    <div className="font-[system-ui,sans-serif] leading-8 h-full">
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

      <button
        type="button"
        onClick={async () => {
          const { searchSeedByBlink } = await wasmReturn

          const result = searchSeedByBlink(
            0,
            [10215, 15000],
            { cooltime: 4, tolerance: 0 },
            [68, 125, 85, 184, 158],
          )
          // 00BDD309
          console.log(result.map((s) => LCG.stringify(s)))
        }}
      >
        HOGE
      </button>
    </div>
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

export default () => (
  <WASMProvider>
    <Index />
  </WASMProvider>
)
