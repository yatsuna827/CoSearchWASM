import { useCallback, useState } from 'react'

const to60fps = (ms: number) => Math.floor((ms / 1000) * 60)

export const useBlinkRecorder = (onFull: (history: number[], lastBlinked: number) => void) => {
  const [count] = useState(5)
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
