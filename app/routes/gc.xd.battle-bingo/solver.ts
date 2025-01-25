import type { BingoPanel, PokemonPanel } from './bingo'

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

export const solve = (sheet: BingoPanel[], pattern: number[]) => {
  const timeline = toTimeline(sheet, pattern)

  {
    const [replay, gameover] = play(timeline, false)
    if (gameover) {
      console.log('ゲームオーバー', gameover.reason)
    } else {
      return { pattern, history: replay }
    }
  }

  {
    const [replay, gameover] = play(timeline, true)
    if (gameover) {
      console.log('ゲームオーバー', gameover.reason)
    } else {
      return { pattern, history: replay }
    }
  }

  return null
}

type Replay = [TurnEvent, Entry, State][]
const play = (timeline: Timeline, useHoundoomForSlowking: boolean): Result<Replay, GameOver> => {
  const agent = makeGeniousAgent()

  const history: [TurnEvent, Entry, State][] = []

  let state: State = {
    houndoom: 2,
    exeggutor: null,
    lunatone: null,
    extraEP: 0,
    gotBonuses: 0,
  }
  for (const ev of timeline) {
    const [entry, error] = agent.onEntry(state, ev, useHoundoomForSlowking)
    if (error) {
      return err(error)
    }

    const [next, error2] = agent.nextState(state, ev, entry)
    if (error2) {
      return err(error2)
    }

    history.push([ev, entry, state] as const)

    state = next
  }

  return ok(history)
}

export const replay = (replay: Replay) => {
  for (const [i, [event, entry, state]] of replay.entries()) {
    console.log(i, event.panel.name, entry.pokemon, entry.useExtraEP ? '(遡及)' : '')
    console.log(JSON.stringify(state))
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
  const onBonusPanel = (state: State): Result<Entry, GameOver> => {
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

    return err({ reason: 'おかしいなあ…？' })
  }
  const onPokemonPanel = (
    state: State,
    panel: PokemonPanel,
    useHoundoomForSlowking: boolean,
  ): Result<Entry, GameOver> => {
    switch (panel.name) {
      case 'ナッシー':
        return onExeggutor(state)
      case 'ルナトーン':
        return onLunatone(state)

      case 'ヤドラン':
      case 'ネンドール':
      case 'チャーレム': {
        if (state.exeggutor == null || (state.exeggutor === 0 && state.extraEP === 0)) {
          return err({ reason: `${panel.name}が倒せない` })
        }

        return ok({ pokemon: 'exeggutor', useExtraEP: state.exeggutor === 0 })
      }

      default: {
        if (!useHoundoomForSlowking && panel.name === 'ヤドキング') {
          if (state.exeggutor != null && (state.exeggutor > 0 || state.extraEP > 0)) {
            return ok({ pokemon: 'exeggutor', useExtraEP: state.exeggutor === 0 })
          }
        }

        if (state.houndoom > 0 || state.extraEP > 0) {
          return ok({ pokemon: 'houndoom', useExtraEP: state.houndoom === 0 })
        }

        return err({ reason: `${panel.name}が倒せない` })
      }
    }
  }
  const onExeggutor = (state: State): Result<Entry, GameOver> => {
    if (state.lunatone) {
      return ok({ pokemon: 'lunatone' })
    }
    if (state.houndoom) {
      return ok({ pokemon: 'houndoom' })
    }
    if (state.extraEP > 0) {
      return ok({ pokemon: 'houndoom', useExtraEP: true })
    }

    return err({ reason: 'おかしいなあ…？' })
  }
  const onLunatone = (state: State): Result<Entry, GameOver> => {
    if (state.houndoom) {
      return ok({ pokemon: 'houndoom' })
    }
    if (state.exeggutor) {
      return ok({ pokemon: 'exeggutor' })
    }
    if (state.extraEP > 0) {
      return ok({ pokemon: 'houndoom', useExtraEP: true })
    }

    return err({ reason: 'おかしいなあ…？' })
  }

  return {
    onEntry(
      state: State,
      { panel }: TurnEvent,
      useHoundoomForSlowking = false,
    ): Result<Entry, GameOver> {
      switch (panel.kind) {
        case 'bonus':
          return onBonusPanel(state)
        case 'pokemon': {
          return onPokemonPanel(state, panel, useHoundoomForSlowking)
        }
      }
    },
    nextState(
      current: State,
      { panel, epToGain }: TurnEvent,
      entry: Entry,
    ): Result<State, GameOver> {
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
    },
  }
}
