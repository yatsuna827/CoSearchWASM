export type TimerId = Branded<number, 'TickId'>

export interface TimerController {
  // 現在時刻を返す
  getTime(): number
  // 次のタイマー更新時に呼び出すコールバックを予約する
  requestTick(callback: (timestamp_ms: number) => void): TimerId
  // 予約されたコールバックの呼び出しをキャンセルする
  cancelTick(tickId: TimerId): void
}

export class OptimizedTimerController implements TimerController {
  getTime(): number {
    return performance.now()
  }
  requestTick(callback: (timestamp_ms: number) => void): TimerId {
    return requestAnimationFrame(callback) as TimerId
  }
  cancelTick(tickId: TimerId): void {
    cancelAnimationFrame(tickId)
  }
}
