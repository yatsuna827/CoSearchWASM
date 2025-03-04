import { slice } from './lapDurations'

export type CascadeTimerContext = {
  lapDurations: number[]

  baseTimestamp: number
  offset: number
}
export type CascadeTimerState = {
  lapIndex: number
  currentLapRemain: number
}

export const asCascadeTimerState = (
  timestamp_ms: number,
  { lapDurations, offset, baseTimestamp }: CascadeTimerContext,
): CascadeTimerState => {
  const elapsed = timestamp_ms - baseTimestamp + offset

  const [lapIndex, remain] = slice(lapDurations, elapsed)

  return {
    lapIndex: lapIndex,
    currentLapRemain: remain,
  }
}
