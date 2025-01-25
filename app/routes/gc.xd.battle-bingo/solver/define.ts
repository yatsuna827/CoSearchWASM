import type { BingoPanel } from '../bingo'

export const GRID_SIZE = 4

export type PartyPokemon = 'houndoom' | 'exeggutor' | 'lunatone'

export type Strategy = {
  pos: number
  panel: BingoPanel
  entry: PartyPokemon
  epAllocation: (PartyPokemon | 'anyone')[] | null
}
