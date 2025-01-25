import type { BingoPanel } from '../bingo'

const GRID_SIZE = 4

type Pos = [number, number]
const pos = (x: number, y: number) => x + y * GRID_SIZE

const MOVES = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
] // Right, Down, Left, Up

const findHamiltonianPaths = (init: Pos): number[][] => {
  const allPaths: number[][] = []

  const visited = Array<boolean>(GRID_SIZE * GRID_SIZE).fill(false)
  const f = ([x, y]: Pos, path: number[]) => {
    if (path.length === GRID_SIZE * GRID_SIZE) {
      allPaths.push([...path])
      return
    }

    for (const [dx, dy] of MOVES) {
      const [nx, ny] = [x + dx, y + dy]
      if (nx < 0 || 3 < nx) continue
      if (ny < 0 || 3 < ny) continue

      const np = nx + ny * 4

      if (visited[np]) continue

      visited[np] = true
      f([nx, ny], [...path, np])
      visited[np] = false
    }
  }

  const [x, y] = init
  visited[pos(x, y)] = true
  f(init, [pos(x, y)])

  return allPaths
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

// EP合計だけを見てクリア可能か判定する
export const solveNaive = (sheet: BingoPanel[]) => {
  const patterns: number[][] = []
  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      const res = findHamiltonianPaths([x, y])
      for (const pattern of res) {
        const bonus = getBingoBonus(pattern)

        let failed = false
        let totalEP = 2
        let gotBonus = 0
        let gotExeggutor = false
        let gotLunatone = false
        for (let i = 0; i < 16; i++) {
          totalEP -= 1

          const pos = pattern[i]
          const panel = sheet[pos]
          if (panel.kind === 'bonus') {
            gotBonus += 1
            if (panel.name === 'EP+1') totalEP += 1
            if (panel.name === 'EP+2') totalEP += 2
          } else {
            if (['ヤドラン', 'ネンドール', 'チャーレム'].includes(panel.name) && !gotExeggutor) {
              failed = true
              break
            }
            if (panel.name === 'ナッシー') {
              gotBonus += 1
              gotExeggutor = true
              totalEP += 2
            }
            if (panel.name === 'ルナトーン') {
              gotLunatone = true
              totalEP += 2
            }
          }

          // ボーナスパネル or ナッシーのうち2つはルナトーンに踏ませないといけない
          if (!gotLunatone && gotBonus === 3) {
            failed = true
            break
          }

          totalEP += bonus[i]

          if (totalEP === 0) {
            failed = true
            break
          }
        }

        if (!failed) {
          patterns.push(pattern)
        }
      }
    }
  }

  return patterns
}
