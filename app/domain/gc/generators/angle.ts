import { Ref } from '@/utilities/ref'
import { type LCG, getRand, next } from '../lcg'

export const generateAngle =
  () =>
  (seed: LCG): LCG => {
    const lcg = Ref.from(seed)
    while (true) {
      const r = lcg.apply(getRand, 10)
      if (r === 3) continue

      if (r === 8) {
        lcg.update(next, 5)
      } else if (r < 5) {
        lcg.update(next)
      } else {
        lcg.update(next, 2)
      }

      break
    }

    return lcg.unwrap()
  }
