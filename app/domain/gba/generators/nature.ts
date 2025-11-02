import { type Nature, natures } from '@/domain/nature'
import { Ref } from '@/utilities/ref'
import { getRand, LCG } from '../lcg'

type G = (seed: LCG) => [Nature | null, LCG]

export const generateNature =
  (x: G[] = []) =>
  (seed: LCG): [Nature, LCG] => {
    const lcg = Ref.from(seed)

    const nature = (() => {
      for (const g of x) {
        const nature = lcg.apply(g)
        if (nature != null) return nature
      }

      return natures[lcg.apply(getRand, 25)]
    })()

    return [nature, lcg.unwrap()]
  }

export const synchronize =
  (syncNature: Nature) =>
  (seed: LCG): [Nature | null, LCG] => {
    const lcg = Ref.from(seed)
    const nature = lcg.apply(getRand, 2) == 0 ? syncNature : null

    return [nature, lcg.unwrap()]
  }

// 実装めんどくさいのだ…。
export const safari = 0

// サファリのポロック処理
const shuffle = (seed: LCG): Nature[] => {
  const lcg = Ref.from(seed)
  const list = [...natures]

  for (let i = 0; i < 25; i++) {
    for (let j = i; j < 25; j++) {
      if (lcg.apply(getRand, 2) === 1) {
        ;[list[i], list[j]] = [list[j], list[i]]
      }
    }
  }

  return list
}
