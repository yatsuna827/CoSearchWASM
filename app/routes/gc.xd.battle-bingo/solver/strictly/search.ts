import type { BingoPanel } from '../../bingo'
import { GRID_SIZE, type PartyPokemon, type Strategy } from '../define'
import type { GameOver } from './define'
import { type Entry, onEntry } from './entry'
import { type Result, err, ok } from './result'
import { getNextState, newState } from './state'
import { type Timeline, type TurnEvent, toTimeline } from './timeline'

export const search = (
  timeline: Timeline,
  useHoundoomForSlowking: boolean,
): Result<Omit<Strategy, 'pos'>[], GameOver> => {
  const history: [TurnEvent, Entry, gotEPs: number][] = []

  let state = newState()
  for (const ev of timeline) {
    const [entry, error] = onEntry(state, ev, useHoundoomForSlowking)
    if (error) {
      return err(error)
    }

    const [pair, error2] = getNextState(state, ev, entry)
    if (error2) {
      return err(error2)
    }

    const [next, gotEPs] = pair

    history.push([ev, entry, gotEPs] as const)

    state = next
  }

  // EPの遅延評価が確定するのでstate更新を計算し直す

  const exEPQueue = history
    .map(([, entry]) => entry)
    .filter(({ useExtraEP }) => useExtraEP)
    .map(({ pokemon }) => pokemon)

  const result: Omit<Strategy, 'pos'>[] = []
  for (const [i, [event, entry, gotEPs]] of history.entries()) {
    const epAllocation: (PartyPokemon | 'anyone')[] = []
    // 16手目はアガリなのでEP配分は無い
    if (gotEPs > 0 && i !== 15) {
      for (let i = 0; i < gotEPs; i++) {
        const p = exEPQueue.shift()
        epAllocation.push(p ?? 'anyone')
      }
    }

    result.push({
      panel: event.panel,
      entry: entry.pokemon,
      epAllocation: epAllocation.length ? epAllocation : null,
    })
  }

  return ok(result)
}
