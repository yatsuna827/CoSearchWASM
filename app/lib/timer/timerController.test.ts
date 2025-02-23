import { type CancelFn, type TimerController, chain } from './timerController'

class TestTimerController implements TimerController {
  #time: number

  constructor() {
    this.#time = 0
  }

  getTime(): number {
    return this.#time
  }
  requestTick(callback: (timestamp_ms: number) => void): CancelFn {
    const current = this.#time
    this.#time++

    setTimeout(() => callback(current))

    return () => {}
  }
}

describe('TestTimerController', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('requestTickを呼び出すとgetTimerがインクリメントされること', () => {
    const controller = new TestTimerController()
    const timeHistory: number[] = []

    timeHistory.push(controller.getTime())
    controller.requestTick(() => {})
    timeHistory.push(controller.getTime())
    controller.requestTick(() => {})
    timeHistory.push(controller.getTime())
    vi.runAllTimers()

    expect(timeHistory).toEqual([0, 1, 2])
  })
  it('requestTickを呼び出すとそのときのtimeの値でコールバック関数が呼び出されること', () => {
    const controller = new TestTimerController()
    const mockCb = vi.fn()

    controller.requestTick(mockCb)
    controller.requestTick(mockCb)
    controller.requestTick(mockCb)
    vi.runAllTimers()

    expect(mockCb).toHaveBeenCalledWith(0)
    expect(mockCb).toHaveBeenCalledWith(1)
    expect(mockCb).toHaveBeenCalledWith(2)
  })
})

describe('chain', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('コールバックがtrueを返す間は連続して呼び出し続けること', () => {
    const controller = new TestTimerController()
    const start = chain(controller)
    const mockCb = vi.fn((time: number) => time < 10)

    start(mockCb)
    vi.runAllTimers()

    // time == 10になる11回目の呼び出しでbreakされる
    expect(mockCb).toHaveBeenCalledTimes(11)
  })
  it('常にfalseを返す関数を登録しても1回は実行される', () => {
    const controller = new TestTimerController()
    const start = chain(controller)
    const mockCb = vi.fn(() => false)

    start(mockCb)
    vi.runAllTimers()

    expect(mockCb).toHaveBeenCalledTimes(1)
  })
})

describe('chain; stress', () => {
  it('1万回くらい呼んでも（適切にtimeoutを呼んでいれば）スタックエラーにならない', () => {
    vi.useFakeTimers({ loopLimit: 1_0010 })

    const controller = new TestTimerController()
    const start = chain(controller)
    const mockCb = vi.fn((time: number) => time < 1_0000)

    start(mockCb)
    vi.runAllTimers()

    expect(mockCb).toHaveBeenCalledTimes(1_0001)

    vi.useRealTimers()
  })
})
