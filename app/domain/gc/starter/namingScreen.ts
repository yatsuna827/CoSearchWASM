import { type LCG, getRand, next, prev } from '../lcg'

export const advanceInNamingScreen = (lcg: LCG): LCG => {
  const [rand, nextSeed] = getRand(lcg)
  return rand < 0x199a ? next(nextSeed, 4) : nextSeed
}

export const backInNamingScreen = (lcg: LCG, n: number): LCG => {
  if (!isValidSeed(lcg)) throw new Error('')

  let prev4 = prev(lcg, 4)
  while (n > 0) {
    n--

    if (prev4 > 0x1999ffff) {
      lcg = prev(lcg)
      prev4 = prev(prev4)
    } else {
      lcg = prev(lcg, 5)
      prev4 = prev(prev4, 5)
    }
  }

  return lcg
}

export const isValidSeed = (lcg: LCG): boolean => {
  const prev1 = lcg > 0x1999ffff
  lcg = prev(lcg)
  const prev2 = lcg > 0x1999ffff
  lcg = prev(lcg)
  const prev3 = lcg > 0x1999ffff
  lcg = prev(lcg)
  const prev4 = lcg > 0x1999ffff

  if (prev1 && prev2 && prev3 && prev4) return true

  lcg = prev(lcg)
  if (lcg < 0x199a0000 && isValidSeed(prev(lcg))) return true
  lcg = prev(lcg)
  if (lcg < 0x199a0000 && prev1 && isValidSeed(prev(lcg))) return true
  lcg = prev(lcg)
  if (lcg < 0x199a0000 && prev1 && prev2 && isValidSeed(prev(lcg))) return true
  lcg = prev(lcg)
  if (lcg < 0x199a0000 && prev1 && prev2 && prev3 && isValidSeed(prev(lcg))) return true

  return false
}
