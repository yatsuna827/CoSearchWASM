import type { BingoPanel } from '../bingo'
import { solveNaive } from './solveNaive'
import { solveStrictly } from './strictly'

export const solve = (sheet: BingoPanel[]) => {
  const candidates = solveNaive(sheet)

  return candidates
    .map((pattern) => solveStrictly(sheet, pattern))
    .filter((_): _ is NonNullable<typeof _> => _ != null)
    .map((strategy) => ({ strategy }))
}
