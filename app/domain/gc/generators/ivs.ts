import type { Attributes } from '@/domain/type'
import { Ref } from '@/utilities/ref'
import { getRand, type LCG } from '../lcg'

export type IVs = Attributes

export const generateIVs = (seed: LCG): [IVs, LCG] => {
  const lcg = Ref.from(seed)
  const hab = lcg.apply(getRand)
  const scd = lcg.apply(getRand)

  return [toIVs(hab, scd), lcg.unwrap()]
}

const toIVs = (hab: number, scd: number): IVs => {
  return [
    (hab >>> 0) & 0x1f,
    (hab >>> 5) & 0x1f,
    (hab >>> 10) & 0x1f,

    (scd >>> 5) & 0x1f,
    (scd >>> 10) & 0x1f,
    (scd >>> 0) & 0x1f,
  ]
}
