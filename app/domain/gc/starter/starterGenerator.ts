import { Ref } from '@/utilities/ref'
import { generateIndividual } from '../generators'
import type { Individual } from '../generators/individual'
import { type LCG, getRand, next } from '../lcg'

export type GenerateStarterResult = {
  seed: LCG
  tid: number
  sid: number
  eevee: Individual
}

export const generateStarter = (seed: LCG): GenerateStarterResult => {
  const lcg = Ref.from(seed)
  lcg.update(next, 1000)

  const tid = lcg.apply(getRand)
  const sid = lcg.apply(getRand)

  const eevee = lcg.apply(generateIndividual)

  return {
    seed,
    tid,
    sid,
    eevee,
  }
}
