import { Ref } from '@/utilities/ref'
import { type LCG } from '../lcg'
import { type IVs, type SchemeName, generateIVs } from './ivs'
import { generatePID } from './pid'

export type IndividualBase = {
  ivs: IVs
  pid: number
}

export const generateStaticSymbol = (scheme: SchemeName) => {
  const genPID = generatePID()
  const genIVs = generateIVs(scheme)

  return (seed: LCG): [IndividualBase, LCG] => {
    const lcg = Ref.from(seed)
    const pid = lcg.apply(genPID)
    const ivs = lcg.apply(genIVs)

    return [{ pid, ivs }, lcg.unwrap()]
  }
}
