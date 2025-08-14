import { Ref } from '@/utilities/ref'
import { getRand, next, type LCG } from '../lcg'
import { generateIVs, type IVs } from './ivs'
import { generatePID } from './pid'

export type Individual = {
  pid: number
  ivs: IVs
  gcAbility: number
}

export const generateIndividual = (seed: LCG): [Individual, LCG] => {
  const lcg = Ref.from(seed)

  lcg.update(next)
  lcg.update(next)

  const ivs = lcg.apply(generateIVs)
  const gcAbility = lcg.apply(getRand, 2)
  const pid = lcg.apply(generatePID)

  return [{ pid, ivs, gcAbility }, lcg.unwrap()]
}
