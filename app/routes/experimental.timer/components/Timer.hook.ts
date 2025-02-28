import { useCallback, useEffect, useRef } from 'react'

import { CascadeTimer } from '@/lib/timer/cascadeTimer'

const from60fps = (frames: number) => Math.ceil((frames * 1000) / 60)

type UseTimerArgs = {
  onTick?: (timer: CascadeTimer) => void
  onLapNext?: (timer: CascadeTimer) => void
}
export const useTimer = ({ onTick, onLapNext }: UseTimerArgs) => {
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

  const onStart = useCallback((lap: number[], timestamp?: number) => {
    const baseTimestamp = timestamp != null ? timestamp - performance.timeOrigin : undefined
    timerRef.current?.start(lap, { baseTimestamp })
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
