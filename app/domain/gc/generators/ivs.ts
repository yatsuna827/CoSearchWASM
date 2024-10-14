import { Ref } from '@util/ref'
import { type LCG, getRand } from '../lcg'

export type IVs = [number, number, number, number, number, number]

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
