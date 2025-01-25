import type { BingoPanel } from '../../bingo'
import { GRID_SIZE, type Strategy } from '../define'
import { search } from './search'
import { toTimeline } from './timeline'

export const solveStrictly = (sheet: BingoPanel[], pattern: number[]): Strategy[] | null => {
  const timeline = toTimeline(sheet, pattern)

  {
    const [replay] = search(timeline, false)
    if (replay) {
      return Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({
        pos: pattern[i],
        ...replay[i],
      }))
    }
  }

  {
    const [replay] = search(timeline, true)
    if (replay) {
      return Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({
        pos: pattern[i],
        ...replay[i],
      }))
    }
  }

  return null
}
