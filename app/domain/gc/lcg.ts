export type LCG = Branded<number, 'LCG'>
export const LCG = {
  from: (seed: number): LCG => (seed >>> 0) as LCG,
  getIndex: (lcg: LCG, from: LCG = 0 as LCG): number => {
    let a = MulConst
    let b = AddConst

    let result = 0
    let seed = (mul(lcg, a) + b) >>> 0
    let mask = 1

    for (let i = 0; i < 32; i++) {
      if ((seed ^ from) & mask) {
        seed = (mul(seed, a) + b) >>> 0
      } else {
        result |= mask
      }

      b = mul(b, a + 1) >>> 0
      a = mul(a, a) >>> 0
      mask <<= 1
    }

    return result >> 0
  },
  tryParse: (raw: string): LCG | null => {
    if (!seedRegex.test(raw)) return null

    try {
      const lcg = LCG.from(Number.parseInt(raw, 16))
      if (!Number.isInteger(lcg)) return null

      return lcg
    } catch {
      return null
    }
  },
}

const seedRegex = /^[0-9a-f]{1,8}$/i

const MulConst = 0x343fd
const AddConst = 0x00269ec3

export const next = (seed: LCG, n = 1): LCG => {
  if (n == null || n === 1) return ((mul(seed, MulConst) + AddConst) >>> 0) as LCG
  if (n === 0) return seed

  return jump(seed, n)
}
export const prev = (seed: LCG, n = 1): LCG => {
  if (n == null || n === 1) return next(seed, -1)
  if (n === 0) return seed

  return jump(seed, -n)
}
export const getRand = (seed: LCG, m?: number): [number, LCG] => {
  const nextSeed = next(seed)
  const r = nextSeed >>> 16
  return [m ? r % m : r, nextSeed]
}

const mul = (a: number, b: number): number => {
  const a_h = a >>> 16
  const a_l = a & 0xffff

  const b_h = b >>> 16
  const b_l = b & 0xffff

  // 最後の>>>0がないと符号あり整数になる
  return (((a_h * b_l + a_l * b_h) << 16) + a_l * b_l) >>> 0
}

type Booster = {
  a_t: number[]
  b_t: number[]
}

const setup = (): Booster => {
  const a_t: number[] = [MulConst]
  const b_t: number[] = [AddConst]

  for (let i = 1; i < 32; i++) {
    a_t.push(mul(a_t[i - 1], a_t[i - 1]))
    b_t.push(mul(b_t[i - 1], 1 + a_t[i - 1]))
  }

  return {
    a_t,
    b_t,
  }
}

const booster = setup()

const jump = (seed: LCG, n: number) => {
  let _seed: number = seed

  const { a_t, b_t } = booster

  let i = 0
  let n_ = n >>> 0
  while (n_ > 0) {
    if (n_ & 1) {
      _seed = (mul(_seed, a_t[i]) + b_t[i]) >>> 0
    }

    i++
    n_ = n_ >>> 1
  }

  return _seed as LCG
}
