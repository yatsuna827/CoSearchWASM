import type { BingoPanel, PokemonPanel } from '../../bingo'

const GRID_SIZE = 4

export type Timeline = TurnEvent[]
export type TurnEvent = {
  panel: BingoPanel
  epToGain: number
}

const getBingoBonus = (panel: number[]) => {
  const card: boolean[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false))

  const checkBingoLine = (x: number, y: number): number => {
    let bingoCount = 0

    // 横方向
    if (card[x].every((cell) => cell)) bingoCount++

    // 縦方向
    if (card.every((row) => row[y])) bingoCount++

    // 左上から右下
    if (x === y && card.every((row, index) => row[index])) bingoCount++
    // 右上から左下
    if (x + y === 3 && card.every((row, index) => row[GRID_SIZE - 1 - index])) bingoCount++

    return bingoCount
  }

  return panel.map((p) => {
    const [x, y] = [p % 4, Math.floor(p / 4)]
    card[x][y] = true

    return checkBingoLine(x, y)
  })
}

export const toTimeline = (sheet: BingoPanel[], pattern: number[]): Timeline => {
  const bingo = getBingoBonus(pattern)
  return Array.from({ length: 16 }, (_, i) => {
    const panel = sheet[pattern[i]]
    let epToGain = bingo[i]
    if (panel.kind === 'bonus' && panel.name === 'EP+1') epToGain += 1
    if (panel.kind === 'bonus' && panel.name === 'EP+2') epToGain += 2

    return { panel: sheet[pattern[i]], epToGain }
  })
}
