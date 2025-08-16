import { Ref } from '@/utilities/ref'
import { getRand, type LCG } from '../lcg'

export const generatePID = (seed: LCG): [number, LCG] => {
  const lcg = Ref.from(seed)
  const hid = lcg.apply(getRand) << 16
  const lid = lcg.apply(getRand)

  const pid = (hid | lid) >>> 0

  return [pid, lcg.unwrap()]
}
