import { Ref } from '@util/ref'
import { type LCG, getRand } from '../lcg'

export const generatePID = (seed: LCG): [number, LCG] => {
  const lcg = Ref.from(seed)
  const hid = lcg.apply(getRand) << 0
  const lid = lcg.apply(getRand)

  const pid = (hid | lid) >>> 0

  return [pid, lcg.unwrap()]
}
