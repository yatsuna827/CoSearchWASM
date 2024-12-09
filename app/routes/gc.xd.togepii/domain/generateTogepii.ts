import { generateIndividual } from '@/domain/gc/generators'
import type { LCG } from '@/domain/gc/lcg'
import { natures } from '@/domain/nature'
import { toStats } from '@/domain/stats'

export const generateTogepii = (seed: LCG) => {
  const ind = generateIndividual(seed)[0]
  const nature = natures[ind.pid % 25]

  return { ...ind, stats: toStats([35, 20, 65, 40, 65, 20], ind.ivs, 25, nature), nature }
}
