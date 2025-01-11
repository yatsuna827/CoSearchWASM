import { type LCG, getRand, next, prev } from '@/domain/gc/lcg'
import { Ref } from '@/utilities/ref'
import { type PokeSpotKind, pokeSpots } from './pokeSpot'

type Option = {
  to: PokeSpotKind
  scooterUpgraded: boolean
}

export const navigateToPokeSpot = ({ to, scooterUpgraded }: Option) => {
  const { beforeUpgrade, afterUpgrade } = pokeSpots[to].navigationAdvance
  const adv = scooterUpgraded ? afterUpgrade : beforeUpgrade

  return (seed: LCG): LCG => {
    const lcg = Ref.from(seed)

    const angle = lcg.apply(getRand, 2)
    lcg.update(next, adv[angle])

    return lcg.unwrap()
  }
}

export const findPath = ({ to, scooterUpgraded }: Option) => {
  const { beforeUpgrade, afterUpgrade } = pokeSpots[to].navigationAdvance
  const [angle0, angle1] = scooterUpgraded ? afterUpgrade : beforeUpgrade

  return (seed: LCG, maxFidgets?: number) => {
    let fidgets = 0

    const result: [LCG, fidgets: number][] = []
    while (true) {
      {
        const a = prev(seed, angle0 + 1)
        const [an] = getRand(a, 2)
        if (an === 0) result.push([a, fidgets])
      }
      {
        const b = prev(seed, angle1 + 1)
        const [an] = getRand(b, 2)
        if (an === 1) result.push([b, fidgets])
      }

      fidgets += 2
      seed = prev(seed, 2)

      if (maxFidgets == null) {
        if (result.length > 0) break
      } else {
        if (fidgets > maxFidgets) break
      }
    }

    return result
  }
}
