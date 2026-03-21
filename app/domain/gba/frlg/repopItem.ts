import { type LCG, getRand } from '@/domain/gba/lcg'
import { Ref } from '@/utilities/ref'

export type ItemCategory = 'common' | 'uncommon' | 'rare'

export const generateRepopItem = (seed: LCG): [ItemCategory, LCG] => {
  const lcg = Ref.from(seed)
  const r = lcg.apply(getRand, 100)
  const category: ItemCategory = r < 60 ? 'common' : r < 90 ? 'uncommon' : 'rare'

  return [category, lcg.unwrap()]
}
