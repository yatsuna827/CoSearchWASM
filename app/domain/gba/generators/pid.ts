import { Ref } from '@/utilities/ref'
import { getRand, type LCG } from '../lcg'

type Options = {
  condition?: (pid: number) => boolean
}

export const generatePID = (options?: Options) => (options?.condition ? withCondition(options.condition) : single)

const single = (seed: LCG): [number, LCG] => {
  const lcg = Ref.from(seed)
  const lid = lcg.apply(getRand)
  const hid = lcg.apply(getRand) << 16

  const pid = (hid | lid) >>> 0

  return [pid, lcg.unwrap()]
}
const withCondition =
  (condition: (pid: number) => boolean) =>
  (seed: LCG): [number, LCG] => {
    const lcg = Ref.from(seed)

    let pid = lcg.apply(single)
    while (!condition(pid)) {
      pid = lcg.apply(single)
    }

    return [pid, lcg.unwrap()]
  }
