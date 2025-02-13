import type { TimerController, TimerId } from './timerController'

class TestableTimerController implements TimerController {
  #now: number
  #cbQueue: FrameRequestCallback[]

  constructor(now = 0) {
    this.#now = now
    this.#cbQueue = []
  }

  getTime(): number {
    return this.#now
  }
  requestTick(callback: (timestamp: number) => void): TimerId {
    const TimerId = this.#cbQueue.length as TimerId
    this.#cbQueue.unshift(callback)
    return TimerId
  }
  cancelTick(TimerId: TimerId): void {
    this.#cbQueue.splice(TimerId, 1)
  }

  private fireTick() {
    const oldCbQueue = [...this.#cbQueue]
    this.#cbQueue = []
    // biome-ignore lint/complexity/noForEach: for ofは遅い
    oldCbQueue.forEach((cb) => cb(this.#now))
  }
  advanceTo(now: number): void {
    this.#now = now
    this.fireTick()
  }
  advanceBy(diff: number): void {
    this.#now += diff
    this.fireTick()
  }
}
