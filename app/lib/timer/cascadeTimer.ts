import { createSTEventTarget } from '../strictly-typed-event-target'
import { OptimizedTimerController, type TimerController, type TimerId } from './timerController'

const INITIAL_START_TIME = 0
const INITIAL_LAST_TICK_TIME = 0
const INITIAL_TIMER_ID = null

export type CascadeTimerStatus = 'initial' | 'countdowning' | 'ended'
export type CascadeTimerState = {
  status: CascadeTimerStatus
  lapRemain: number
  lapIndex: number
  offset: number
}

export type UnsubscribeFn = () => void

const createLapState = (
  lapDuration: number[],
  elapsed: number,
): Pick<CascadeTimerState, 'lapIndex' | 'lapRemain'> => {
  let sum = 0
  for (let i = 0; i < lapDuration.length; i++) {
    sum += lapDuration[i]

    if (elapsed < sum) {
      return {
        lapIndex: i,
        lapRemain: sum - elapsed,
      }
    }
  }

  return {
    lapIndex: lapDuration.length - 1,
    lapRemain: 0,
  }
}

// [イベント名]: 渡されるオブジェクト
type CascadeTimerEventMap = {
  tick: undefined
}
const [TimerCustomEvent, TimerEventEmitter] = createSTEventTarget<CascadeTimerEventMap>()

export class CascadeTimer {
  readonly #lapDurations: number[]
  readonly #emitter: typeof TimerEventEmitter
  readonly #controller: TimerController

  #status: CascadeTimerStatus
  #startTime: number
  #lastTickTime: number
  #offset: number
  #timerId: TimerId | null

  constructor(
    lapDuration: number[],
    offset = 0,
    controller: TimerController = new OptimizedTimerController(),
  ) {
    if (lapDuration.length === 0) throw new Error('あほしね')

    this.#lapDurations = [...lapDuration]
    this.#emitter = new TimerEventEmitter()
    this.#controller = controller

    this.#status = 'initial'
    this.#startTime = INITIAL_START_TIME
    this.#lastTickTime = INITIAL_LAST_TICK_TIME
    this.#offset = offset
    this.#timerId = INITIAL_TIMER_ID
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

  start(startTime?: number) {
    if (this.#timerId !== INITIAL_TIMER_ID) {
      throw new Error('カウントダウン中は呼び出しちゃいけませんよ')
    }

    const now = this.#controller.getTime()
    if (startTime !== undefined && startTime > now) {
      throw new Error('タイマーの開始時間は現在時刻より前でなければなりません')
    }

    const lastLapIndex = this.#lapDurations.length - 1
    const onTick = (timestamp_ms: number) => {
      const elapsed = timestamp_ms - this.#startTime + this.#offset
      const { lapIndex, lapRemain } = createLapState(this.#lapDurations, elapsed)
      const next: CascadeTimerStatus =
        lapIndex === lastLapIndex && lapRemain === 0 ? 'ended' : 'countdowning'

      if (next === 'countdowning') {
        this.#timerId = this.#controller.requestTick(onTick)
      } else {
        this.#timerId = null
      }

      this.#status = next
      this.#lastTickTime = timestamp_ms
      this.#emitter.dispatchEvent(new TimerCustomEvent('tick'))
    }

    this.#status = 'countdowning'
    this.#startTime = startTime ?? now
    this.#lastTickTime = startTime ?? now
    this.#timerId = this.#controller.requestTick(onTick)
  }

  reset() {
    if (this.#timerId != null) {
      this.#controller.cancelTick(this.#timerId)
    }

    this.#status = 'initial'
    this.#startTime = INITIAL_START_TIME
    this.#lastTickTime = INITIAL_LAST_TICK_TIME
    this.#timerId = INITIAL_TIMER_ID
  }

  setOffset(offset: number) {
    this.#offset = offset
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
