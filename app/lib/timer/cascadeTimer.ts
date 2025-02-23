import { TypedEventTarget } from 'typescript-event-target'

import {
  type CancelFn,
  OptimizedTimerController,
  type TimerController,
  chain,
} from './timerController'

const INITIAL_START_TIME = 0
const INITIAL_LAST_TICK_TIME = 0

export type CascadeTimerStatus = 'initial' | 'countdowning' | 'ended'
export type CascadeTimerState = {
  status: CascadeTimerStatus
  lapRemain: number
  offset: number
  lapDurationsRemain: number[]
}

export type UnsubscribeFn = () => void

const createLapState = (
  lapDuration: number[],
  elapsed: number,
): Pick<CascadeTimerState, 'lapDurationsRemain' | 'lapRemain'> => {
  let sum = 0
  for (let i = 0; i < lapDuration.length; i++) {
    sum += lapDuration[i]

    if (elapsed < sum) {
      return {
        lapDurationsRemain: lapDuration.slice(i),
        lapRemain: sum - elapsed,
      }
    }
  }

  return {
    lapDurationsRemain: [],
    lapRemain: 0,
  }
}

// [イベント名]: 渡されるオブジェクト
type CascadeTimerEventMap = {
  tick: CustomEvent<undefined>
}

export class CascadeTimer {
  #lapDurations: number[]
  readonly #emitter: TypedEventTarget<CascadeTimerEventMap>
  readonly #controller: TimerController

  #status: CascadeTimerStatus
  #startTime: number
  #lastTickTime: number
  #offset: number
  #cleanup: CancelFn | null

  constructor(offset = 0, controller: TimerController = new OptimizedTimerController()) {
    this.#lapDurations = []
    this.#emitter = new TypedEventTarget()
    this.#controller = controller

    this.#status = 'initial'
    this.#startTime = INITIAL_START_TIME
    this.#lastTickTime = INITIAL_LAST_TICK_TIME
    this.#offset = offset
    this.#cleanup = null
  }

  private getElapsed(): number {
    switch (this.#status) {
      case 'initial':
        return this.#offset
      case 'countdowning':
        return this.#lastTickTime - this.#startTime + this.#offset
      case 'ended':
        return Number.MAX_SAFE_INTEGER
      default:
        throw new Error(`Invalid #status ${this.#status satisfies never}`)
    }
  }
  getState(): CascadeTimerState {
    return {
      status: this.#status,
      offset: this.#offset,
      ...createLapState(this.#lapDurations, this.getElapsed()),
    }
  }

  start(lapDurations: number[], startTime?: number) {
    if (this.#cleanup !== null) {
      throw new Error('カウントダウン中は呼び出しちゃいけませんよ')
    }

    this.#lapDurations = [...lapDurations]
    const now = this.#controller.getTime()
    if (startTime !== undefined && startTime > now) {
      throw new Error('タイマーの開始時間は現在時刻より前でなければなりません')
    }

    const start = chain(this.#controller)

    this.#status = 'countdowning'
    this.#startTime = startTime ?? now
    this.#lastTickTime = startTime ?? now
    this.#cleanup = start((ms) => this.onTick(ms))
  }

  private onTick(timestamp_ms: number): boolean {
    const elapsed = timestamp_ms - this.#startTime + this.#offset
    const { lapDurationsRemain, lapRemain } = createLapState(this.#lapDurations, elapsed)
    const next: CascadeTimerStatus =
      lapDurationsRemain.length === 0 && lapRemain === 0 ? 'ended' : 'countdowning'

    this.#status = next
    // console.log(timestamp_ms - this.#lastTickTime)
    this.#lastTickTime = timestamp_ms

    this.#emitter.dispatchTypedEvent('tick', new CustomEvent('tick'))

    return next === 'countdowning'
  }

  reset() {
    this.#cleanup?.()

    this.#status = 'initial'
    this.#startTime = INITIAL_START_TIME
    this.#lastTickTime = INITIAL_LAST_TICK_TIME
    this.#cleanup = null
  }

  setOffset(offset: number) {
    this.#offset = offset
  }

  addLap(duration: number) {
    this.#lapDurations.push(duration)
  }

  addEventListener<K extends keyof CascadeTimerEventMap>(
    type: K,
    listener: (() => void) | null,
    options?: boolean | AddEventListenerOptions,
  ): UnsubscribeFn {
    this.#emitter.addEventListener(type, listener, options)

    return () => {
      this.#emitter.removeEventListener(type, listener, options)
    }
  }
}
