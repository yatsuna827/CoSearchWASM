export type CancelFn = () => void

export interface TimerController {
  // 現在時刻を返す
  getTime(): number
  // 次のタイマー更新時に呼び出すコールバックを予約する
  requestTick(callback: (timestamp_ms: number) => void): CancelFn
}

export class OptimizedTimerController implements TimerController {
  getTime(): number {
    return performance.now()
  }
  requestTick(callback: (timestamp_ms: number) => void): CancelFn {
    const timerId = requestAnimationFrame(callback)
    return () => cancelAnimationFrame(timerId)
  }
}

export const optimizedTimerController: TimerController = {
  getTime(): number {
    return performance.now()
  },
  requestTick(callback: (timestamp_ms: number) => void): CancelFn {
    const timerId = requestAnimationFrame(callback)
    return () => cancelAnimationFrame(timerId)
  },
}

export const chain =
  (ticker: TimerController) =>
  (onTick: (timestamp_ms: number) => boolean): CancelFn => {
    let cancel: CancelFn | null = null
    const handleTick = (timestamp_ms: number) => {
      const continue_ = onTick(timestamp_ms)

      if (continue_) {
        cancel = ticker.requestTick(handleTick)
      } else {
        cancel = null
      }
    }
    cancel = ticker.requestTick(handleTick)

    return () => cancel?.()
  }
