import { IVs } from './gba/generators/ivs'
import { PokeType } from './pokeType'

const typeIndex = [
  'fighting',
  'flying',
  'poison',
  'ground',
  'rock',
  'bug',
  'ghost',
  'steel',
  'fire',
  'water',
  'grass',
  'electric',
  'phychic',
  'ice',
  'dragon',
  'dark',
] satisfies PokeType[]

const hiddenPowerPower = ([h, a, b, c, d, s]: IVs): number => {
  const n =
    ((h >> 1) & 1) +
    2 * ((a >> 1) & 1) +
    4 * ((b >> 1) & 1) +
    8 * ((s >> 1) & 1) +
    16 * ((c >> 1) & 1) +
    32 * ((d >> 1) & 1)

  return 30 + Math.floor((n * 40) / 63)
}

const hiddenPowerType = ([h, a, b, c, d, s]: IVs): PokeType => {
  const n = (h & 1) + 2 * (a & 1) + 4 * (b & 1) + 8 * (s & 1) + 16 * (c & 1) + 32 * (d & 1)

  const index = Math.floor((n * 15) / 63)

  return typeIndex[index]
}

export const toHiddenPower = (ivs: IVs): [PokeType, number] => [hiddenPowerType(ivs), hiddenPowerPower(ivs)]
