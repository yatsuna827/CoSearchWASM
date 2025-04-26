import { slice } from './lapDurations'

type RunTimerContext = {
  lapDurations: number[]
  getElapsed: (timestamp: number) => number

  onUpdate: (lapRemain: number, totalRemain: number) => void
  onShift: (lapIndex: number) => void
  onComplete: () => void
}
export const runCascadeTimer = async (
  run: () => AsyncGenerator<number, void, unknown>,
  { lapDurations, getElapsed, onShift, onComplete, onUpdate }: RunTimerContext,
) => {
  const totalDurations = lapDurations.reduce((prev, cur) => prev + cur, 0)

  // 初期化したい
  let prevIndex = 0
  for await (const timestamp of run()) {
    const elapsed = getElapsed(timestamp)
    const [lapIndex, currentLapRemain] = slice(lapDurations, elapsed)

    if (prevIndex < lapIndex) {
      onShift(lapIndex)
    }

    const remain = totalDurations - elapsed
    onUpdate(currentLapRemain, remain)

    if (remain <= 0) {
      onComplete()
      break
    }

    prevIndex = lapIndex
  }
}
