import { type LCG, getRand } from '@/domain/gba/lcg'
import { Ref } from '@/utilities/ref'

export type EggHolding = {
  lid: number
}
export type Compatibility = 'NotBad' | 'Good' | 'VeryWell'
const thresholds = {
  NotBad: 20,
  Good: 50,
  VeryWell: 70,
} satisfies Record<Compatibility, number>

export const generateEggHolding = (comp: Compatibility) => {
  const threshold = thresholds[comp]

  return (seed: LCG): [EggHolding | null, LCG] => {
    const lcg = Ref.from(seed)

    const laying = Math.floor((lcg.apply(getRand) * 100) / 0xffff) < threshold
    const lid = laying ? lcg.apply(getRand, 0xfffe) + 1 : null

    return [lid != null ? { lid } : null, lcg.unwrap()]
  }
}
