import type { BingoPanel } from './bingo'

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

export const solve = (sheet: BingoPanel[]) => {
  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      const res = findHamiltonianPaths([x, y])
      for (const pattern of res) {
        const timeline = toTimeline(sheet, pattern)

        const agent = makeAgent(timeline)

        let failed = false
        for (let i = 0; i < 16; i++) {
          const result = agent.onEntry(timeline[i])
          if (result === 'GAME_OVER') {
            failed = true
            break
          }
        }

        if (!failed) {
          return { pattern, history: agent.getHistory() }
        }
      }
    }
  }

  return null
}

type Timeline = TurnEvent[]
type TurnEvent = {
  panel: BingoPanel
  epToGain: number
}
const toTimeline = (sheet: BingoPanel[], pattern: number[]): Timeline => {
  const bingo = getBingoBonus(pattern)
  return Array.from({ length: 16 }, (_, i) => {
    const panel = sheet[pattern[i]]
    let epToGain = bingo[i]
    if (panel.kind === 'bonus' && panel.name === 'EP+1') epToGain += 1
    if (panel.kind === 'bonus' && panel.name === 'EP+2') epToGain += 2

    return { panel: sheet[pattern[i]], epToGain }
  })
}
const pokeName = {
  exeggutor: 'ナッシー',
  houndoom: 'ヘルガー',
  lunatone: 'ルナトーン',
} as const
export const simulate = (sheet: BingoPanel[], pattern: number[]) => {
  const timeline = toTimeline(sheet, pattern)

  const agent = makeGeniousAgent()
  let state: State = {
    houndoom: 2,
    exeggutor: null,
    lunatone: null,
    extraEP: 0,
    gotBonuses: 0,
  }

  let failed = false
  for (const ev of timeline) {
    console.log(print(ev))
    const [entry, err] = agent.onEntry(state, ev, true)
    if (err) {
      failed = true
      console.log('ゲームオーバー', err.reason)
      break
    }

    console.log(`${pokeName[entry.pokemon]}をエントリー`, entry.useExtraEP ? '(遡及)' : '')

    const [next, err2] = agent.nextState(state, ev, entry)
    if (err2) {
      failed = true
      console.log('ゲームオーバー', err2.reason)
      break
    }
    state = next
  }

  if (!failed) {
    return { pattern, history: [] }
  }

  console.log()
  console.log('ヤドキングにヘルガーを当てて再試行…')
  console.log()

  state = {
    houndoom: 2,
    exeggutor: null,
    lunatone: null,
    extraEP: 0,
    gotBonuses: 0,
  }

  failed = false
  for (const ev of timeline) {
    console.log(print(ev))
    const [entry, err] = agent.onEntry(state, ev, false)
    if (err) {
      failed = true
      console.log('ゲームオーバー', err.reason)
      break
    }

    console.log(`${pokeName[entry.pokemon]}をエントリー`, entry.useExtraEP ? '(遡及)' : '')

    const [next, err2] = agent.nextState(state, ev, entry)
    if (err2) {
      failed = true
      console.log('ゲームオーバー', err2.reason)
      break
    }
    state = next
  }

  if (!failed) {
    return { pattern, history: [] }
  }

  return null
}

const print = ({ panel, epToGain }: TurnEvent) => {
  const event = panel.kind === 'bonus' ? panel.name : panel.name
  return JSON.stringify({ event, epToGain })
}

const makeAgent = (timeline: TurnEvent[]) => {
  const ep = {
    houndoom: 2,
    exeggutor: null as number | null,
    lunatone: null as number | null,
  }

  let leftHoundoomTarget = 6
  let leftExeggutorTarget = 3
  let gotBonuses = 0
  const history: string[] = []

  const onGetEP = (bonus: number) => {
    let exeggutor = 0
    while (
      exeggutor < bonus &&
      ep.exeggutor &&
      (!leftHoundoomTarget ||
        (ep.houndoom > 0 && ep.exeggutor < leftExeggutorTarget && ep.exeggutor < 1))
    ) {
      exeggutor++
    }
    if (exeggutor && ep.exeggutor) {
      console.log(`ナッシーにEP+${exeggutor}`, ep.exeggutor)
      ep.exeggutor += exeggutor
      bonus -= exeggutor
    }

    if (bonus) {
      ep.houndoom += bonus
      console.log(`ヘルガーにEP+${bonus}`, ep.houndoom)
    }
  }
  const onEntry = ({ panel, epToGain }: TurnEvent) => {
    if (panel.kind === 'bonus') {
      gotBonuses++

      if (ep.lunatone) {
        ep.lunatone--
        console.log(panel.name, 'ルナトーンをエントリー', ep.lunatone)
      } else if (ep.houndoom) {
        ep.houndoom--
        console.log(panel.name, 'ヘルガーをエントリー', ep.houndoom)
      } else if (ep.exeggutor) {
        ep.exeggutor--
        console.log(panel.name, 'ナッシーをエントリー', ep.exeggutor)
      } else {
        return 'GAME_OVER'
      }
    } else {
      switch (panel.name) {
        case 'ナッシー': {
          if (ep.lunatone) {
            ep.lunatone--
            console.log(panel.name, 'ルナトーンをエントリー', ep.lunatone)
          } else if (ep.houndoom) {
            ep.houndoom--
            console.log(panel.name, 'ヘルガーをエントリー', ep.houndoom)
          } else return 'GAME_OVER'

          ep.exeggutor = 2

          gotBonuses++

          break
        }
        case 'ルナトーン': {
          if (ep.houndoom) {
            ep.houndoom--
            console.log(panel.name, 'ヘルガーをエントリー', ep.houndoom)
          } else if (ep.exeggutor) {
            ep.exeggutor--
            console.log(panel.name, 'ナッシーをエントリー', ep.exeggutor)
          }

          ep.lunatone = 2

          break
        }

        case 'ヤドラン':
        case 'ネンドール':
        case 'チャーレム': {
          if (!ep.exeggutor) {
            console.log(`${panel.name}が倒せない…`)
            return 'GAME_OVER'
          }

          console.log(panel.name, 'ナッシーをエントリー', ep.exeggutor)
          ep.exeggutor--
          leftExeggutorTarget--

          break
        }

        default: {
          leftHoundoomTarget--
          if (ep.exeggutor && panel.name === 'ヤドキング') {
            ep.exeggutor--
            console.log(panel.name, 'ナッシーをエントリー', ep.exeggutor)
          } else if (ep.houndoom) {
            ep.houndoom--
            console.log(panel.name, 'ヘルガーをエントリー', ep.houndoom)
          } else {
            console.log(`${panel.name}が倒せない…`, ep)
            return 'GAME_OVER'
          }

          break
        }
      }
    }

    if (ep.lunatone == null && gotBonuses > 2) {
      console.log('ルナトーンが余る', ep)
      return 'GAME_OVER'
    }

    if (epToGain > 0) {
      console.log(`${epToGain}EP入手`)
      onGetEP(epToGain)
    }

    const totalEP = ep.houndoom + (ep.exeggutor ?? 0) + (ep.lunatone ?? 0)
    if (totalEP === 0) {
      console.log('EPが尽きた…', ep)
      return 'GAME_OVER'
    }

    // history.push(`${panel.kind === 'bonus' ? panel.name : panel.name} --- left EP ${totalEP}`)
  }

  return {
    onEntry,
    getHistory: () => history,
  }
}

type Result<T, E> = readonly [T, null] | readonly [null, E]
const ok = <T>(v: T) => [v, null] as const
const err = <E>(e: E) => [null, e] as const

type Entry = {
  pokemon: 'houndoom' | 'exeggutor' | 'lunatone'
  useExtraEP?: boolean
}
type GameOver = {
  reason?: string
}

type State = {
  houndoom: number
  exeggutor: number | null
  lunatone: number | null
  extraEP: number
  gotBonuses: number
}
const makeGeniousAgent = () => {
  const onEntry = (
    state: State,
    { panel }: TurnEvent,
    yadoking_vs_exeggutor: boolean,
  ): Result<Entry, GameOver> => {
    switch (panel.kind) {
      case 'bonus': {
        if (state.lunatone) {
          return ok({ pokemon: 'lunatone' })
        }
        if (state.houndoom) {
          return ok({ pokemon: 'houndoom' })
        }
        if (state.exeggutor) {
          return ok({ pokemon: 'exeggutor' })
        }
        if (state.extraEP > 0) {
          return ok({ pokemon: 'houndoom', useExtraEP: true })
        }

        break
      }
      case 'pokemon': {
        switch (panel.name) {
          case 'ナッシー': {
            if (state.lunatone) {
              return ok({ pokemon: 'lunatone' })
            }
            if (state.houndoom) {
              return ok({ pokemon: 'houndoom' })
            }
            if (state.extraEP > 0) {
              return ok({ pokemon: 'houndoom', useExtraEP: true })
            }
            break
          }
          case 'ルナトーン': {
            if (state.houndoom) {
              return ok({ pokemon: 'houndoom' })
            }
            if (state.exeggutor) {
              return ok({ pokemon: 'exeggutor' })
            }
            if (state.extraEP > 0) {
              return ok({ pokemon: 'houndoom', useExtraEP: true })
            }

            break
          }

          case 'ヤドラン':
          case 'ネンドール':
          case 'チャーレム': {
            if (state.exeggutor == null || (state.exeggutor === 0 && state.extraEP === 0)) {
              return err({ reason: `${panel.name}が倒せない` })
            }

            return ok({ pokemon: 'exeggutor', useExtraEP: state.exeggutor === 0 })
          }

          default: {
            if (
              yadoking_vs_exeggutor &&
              panel.name === 'ヤドキング' &&
              state.exeggutor != null &&
              (state.exeggutor > 0 || state.extraEP > 0)
            ) {
              return ok({ pokemon: 'exeggutor', useExtraEP: state.exeggutor === 0 })
            }

            if (state.houndoom > 0 || state.extraEP > 0) {
              return ok({ pokemon: 'houndoom', useExtraEP: state.houndoom === 0 })
            }

            return err({ reason: `${panel.name}が倒せない` })
          }
        }
      }
    }

    return err({ reason: 'おかしいなあ…？' })
  }

  const nextState = (
    current: State,
    { panel, epToGain }: TurnEvent,
    entry: Entry,
  ): Result<State, GameOver> => {
    const next = { ...current }

    // ルナトーンの役割対象のカウント
    if (panel.kind === 'bonus' || panel.name === 'ナッシー') {
      next.gotBonuses++
    }

    // 捕獲したポケモンのセット
    if (panel.kind === 'pokemon' && panel.name === 'ナッシー') {
      next.exeggutor = 2
    }
    if (panel.kind === 'pokemon' && panel.name === 'ルナトーン') {
      next.lunatone = 2
    }

    // エントリーしたポケモンのEPを消費
    if (entry.useExtraEP) {
      next.extraEP--
    } else {
      next[entry.pokemon]--
    }

    // 獲得したEPの割り振り
    if (epToGain > 0) {
      if (next.exeggutor != null) {
        next.extraEP += epToGain
      } else {
        next.houndoom += epToGain
      }
    }

    // ゲームオーバー判定
    if (next.lunatone == null && next.gotBonuses > 2) {
      return err({ reason: 'ルナトーンが余る' })
    }

    const totalEP = next.houndoom + (next.exeggutor ?? 0) + (next.lunatone ?? 0) + next.extraEP
    if (totalEP === 0) {
      return err({ reason: 'EPが尽きた' })
    }

    return ok(next)
  }

  return {
    onEntry,
    nextState,
  }
}
