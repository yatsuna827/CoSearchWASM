import { Ref } from '@/utilities/ref'
import { getRand, LCG } from '../lcg'

type Slot = {
  level: [min: number, max: number]
}

const standard = (slot: Slot) => {
  const [min, max] = slot.level
  const base = min
  const range = max - min + 1

  return (seed: LCG): [number, LCG] => {
    const lcg = Ref.from(seed)
    const level = base + lcg.apply(getRand, range)

    return [level, lcg.unwrap()]
  }
}

const pressure = (slot: Slot) => {
  const [min, max] = slot.level
  const base = min
  const range = max - min + 1

  return (seed: LCG): [number, LCG] => {
    const lcg = Ref.from(seed)
    let level = base + (lcg.apply(getRand, 2) === 1 ? range : lcg.apply(getRand, range))
    if (level !== min) level--

    return [level, lcg.unwrap()]
  }
}

const SCHEME = {
  standard,
  pressure,
} as const

export const genrateLevel = (scheme: keyof typeof SCHEME = 'standard') => SCHEME[scheme]
