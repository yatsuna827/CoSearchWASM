import { type LCG, getRand } from '@/domain/gc/lcg'
import { Ref } from '@util/ref'

export const generateDirection = (seed: LCG): [number, LCG] => {
  const lcg = Ref.from(seed)

  const rand = lcg.apply(getRand) / 65536

  return [2 * Math.PI * rand, lcg.unwrap()]
}
