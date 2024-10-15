import { Ref } from '@/utilities/ref'
import { generateIndividual } from '../generators'
import { type LCG, getRand, next } from '../lcg'

export const generateStarter = (seed: LCG) => {
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
