import { TypedEventTarget } from 'typescript-event-target'

import {
  type CancelFn,
  OptimizedTimerController,
  type TimerController,
  chain,
} from './timerController'

export type CascadeTimerStatus = CascadeTimerState['status']
export type CascadeTimerState =
  | CascadeTimerStateInitial
  | CascadeTimerStateCountdowning
  | CascadeTimerStateEnded

type CascadeTimerStateInitial = { status: 'initial' }
type CascadeTimerStateCountdowning = {
  status: 'countdowning'
  lapRemain: number
  lapDurationsRemain: number[]
  _durationIndex: number
}
type CascadeTimerStateEnded = { status: 'ended' }

export type UnsubscribeFn = () => void

type CascadeTimerEventMap = {
  tick: CustomEvent<undefined>
  'next-lap': CustomEvent<undefined>
  'timer-completed': CustomEvent<undefined>
}

type TimerContext = {
  lapDurations: number[]

  baseTimestamp: number
  offset: number
}
const dispatchLapState = (
  { lapDurations, offset, baseTimestamp }: TimerContext,
  timestamp_ms: number,
): CascadeTimerStateCountdowning | CascadeTimerStateEnded => {
  const elapsed = timestamp_ms - baseTimestamp + offset

  let sum = 0
  for (let i = 0; i < lapDurations.length; i++) {
    sum += lapDurations[i]

    if (elapsed < sum) {
      return {
        status: 'countdowning',
        lapDurationsRemain: lapDurations.slice(i),
        lapRemain: sum - elapsed,
        _durationIndex: i,
      }
    }
  }

  return {
    status: 'ended',
  }
}

type Option = {
  baseTimestamp?: number
  offset?: number
}
export class CascadeTimer {
  readonly #emitter: TypedEventTarget<CascadeTimerEventMap>
  readonly #controller: TimerController
  #cleanup: CancelFn | null

  #context: TimerContext | null
  #state: CascadeTimerState

  constructor(controller: TimerController = new OptimizedTimerController()) {
    this.#emitter = new TypedEventTarget()
    this.#controller = controller
    this.#cleanup = null

    this.#context = null
    this.#state = { status: 'initial' }
  }

  getState(): CascadeTimerState {
    return { ...this.#state }
  }

  start(lapDurations: number[], option?: Option) {
    if (this.#context !== null) {
      console.warn('Timer is already running. Start request ignored.')
      return
    }

    const now = this.#controller.getTime()
    if (option?.baseTimestamp !== undefined && option.baseTimestamp > now) {
      throw new Error('タイマーの開始時間は現在時刻より前でなければなりません')
    }

    this.#context = {
      lapDurations: [...lapDurations],
      baseTimestamp: option?.baseTimestamp ?? now,
      offset: option?.offset ?? 0,
    }
    this.#state = dispatchLapState(this.#context, now)

    this.#cleanup = chain(this.#controller)((ms) => this.onTick(ms))
  }

  private onTick(timestamp_ms: number): boolean {
    if (!this.#context) return false

    const nextState = dispatchLapState(this.#context, timestamp_ms)
    const prevState = this.#state

    this.#state = nextState
    this.#emitter.dispatchTypedEvent('tick', new CustomEvent('tick'))

    const isShifted =
      prevState.status === 'countdowning' &&
      nextState.status === 'countdowning' &&
      prevState._durationIndex < nextState._durationIndex
    if (isShifted) {
      this.#emitter.dispatchTypedEvent('next-lap', new CustomEvent('next-lap'))
    }

    if (nextState.status === 'ended') {
      this.#emitter.dispatchTypedEvent('timer-completed', new CustomEvent('timer-completed'))
    }

    return nextState.status === 'countdowning'
  }

  cancel() {
    this.#cleanup?.()

    this.#state = { status: 'initial' }
    this.#context = null
    this.#cleanup = null
  }

  reset() {
    this.#cleanup?.()

    this.#state = { status: 'initial' }
    this.#context = null
    this.#cleanup = null
  }

  setOffset(offset: number) {
    if (this.#context == null) return

    this.#context.offset = offset
  }

  addLap(duration: number) {
    if (this.#context == null) return

    this.#context.lapDurations.push(duration)
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
