import type { PokemonPanel } from '../../bingo'
import type { PartyPokemon } from '../define'
import type { GameOver } from './define'
import { type Result, err, ok } from './result'
import type { State } from './state'
import type { TurnEvent } from './timeline'

export type Entry = {
  pokemon: PartyPokemon
  useExtraEP?: boolean
}

// 使用するポケモンの選択
export const onEntry = (
  state: State,
  { panel }: TurnEvent,
  useHoundoomForSlowking = false,
): Result<Entry, GameOver> => {
  switch (panel.kind) {
    case 'bonus':
      return onBonusPanel(state)
    case 'pokemon': {
      return onPokemonPanel(state, panel, useHoundoomForSlowking)
    }
  }
}

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
