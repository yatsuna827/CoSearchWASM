import type { PartyPokemon } from '../define'
import type { GameOver } from './define'
import type { Entry } from './entry'
import { type Result, err, ok } from './result'
import type { TurnEvent } from './timeline'

export type State = {
  houndoom: number
  exeggutor: number | null
  lunatone: number | null
  extraEP: number
  gotBonuses: number
}
export const newState = (): State => ({
  houndoom: 2,
  exeggutor: null,
  lunatone: null,
  extraEP: 0,
  gotBonuses: 0,
})

export const getNextState = (
  state: State,
  event: TurnEvent,
  entry: Entry,
): Result<[State, GetEPCommand[]], GameOver> => {
  const commands = getCommands(event, entry, state.exeggutor != null)
  const [next, error] = applyCommand(state, commands)

  const getEPCommands = commands.filter((c): c is GetEPCommand => c.kind === 'get-ep')
  return error ? err(error) : ok([next, getEPCommands])
}

type Command = CatchCommand | DecrementEPCommand | GetEPCommand | IncrementLunatoneTargetCommand
type CatchCommand = {
  kind: 'catch'
  pokemon: 'exeggutor' | 'lunatone'
}
type DecrementEPCommand = {
  kind: 'decrement-ep'
  entry: PartyPokemon | 'extraEP'
}
type GetEPCommand = {
  kind: 'get-ep'
  for: 'houndoom' | 'extraEP'
  value: number
}
type IncrementLunatoneTargetCommand = {
  kind: 'inc-lunatone-target'
}

const getCommands = ({ panel, epToGain }: TurnEvent, entry: Entry, hasExeggutor: boolean): Command[] => {
  const result: Command[] = []

  // ルナトーンの役割対象のカウント
  if (panel.kind === 'bonus' || panel.name === 'ナッシー') {
    result.push({ kind: 'inc-lunatone-target' })
  }

  // 捕獲したポケモンのセット
  if (panel.kind === 'pokemon' && panel.name === 'ナッシー') {
    result.push({ kind: 'catch', pokemon: 'exeggutor' })
  }
  if (panel.kind === 'pokemon' && panel.name === 'ルナトーン') {
    result.push({ kind: 'catch', pokemon: 'lunatone' })
  }

  // エントリーしたポケモンのEPを消費
  if (entry.useExtraEP) {
    result.push({ kind: 'decrement-ep', entry: 'extraEP' })
  } else {
    result.push({ kind: 'decrement-ep', entry: entry.pokemon })
  }

  // 獲得したEPの割り振り
  if (epToGain > 0) {
    const caughtExeggutor = panel.kind === 'pokemon' && panel.name === 'ナッシー'
    // ナッシーが手持ちにいる状態であれば、EP割り振りは遅延評価する
    if (hasExeggutor || caughtExeggutor) {
      result.push({ kind: 'get-ep', for: 'extraEP', value: epToGain })
    } else {
      result.push({ kind: 'get-ep', for: 'houndoom', value: epToGain })
    }
  }

  return result
}
const applyCommand = (state: State, commands: Command[]): Result<State, GameOver> => {
  const next = { ...state }

  for (const command of commands) {
    switch (command.kind) {
      case 'catch': {
        next[command.pokemon] = 2
        break
      }
      case 'get-ep': {
        next[command.for] += command.value
        break
      }
      case 'decrement-ep': {
        next[command.entry]--
        break
      }
      case 'inc-lunatone-target': {
        next.gotBonuses++
      }
    }
  }

  if (next.lunatone == null && next.gotBonuses > 2) {
    // ゲームオーバー判定
    return err({ reason: 'ルナトーンが余る' })
  }

  const totalEP = next.houndoom + (next.exeggutor ?? 0) + (next.lunatone ?? 0) + next.extraEP
  if (totalEP === 0) {
    return err({ reason: 'EPが尽きた' })
  }

  return ok(next)
}
