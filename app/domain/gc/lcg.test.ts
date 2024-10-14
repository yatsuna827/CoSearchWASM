import { describe, expect, it } from 'vitest'
import { LCG, getRand, next, prev } from './lcg'

describe('LCG.getIndex', () => {
  it('12345進めたseedのindexは12345', () => {
    const seed = LCG.from(0xbeef)
    const after12345 = next(seed, 12345)

    expect(LCG.getIndex(after12345, seed)).toBe(12345)
  })

  it('差が2^31を超える場合はデフォルトでは負数で返される', () => {
    const seed = LCG.from(0xbeef)
    const otherSide = next(seed, 0xffffffff)

    const result = LCG.getIndex(otherSide, seed)

    expect(result).toBe(-1)
    expect(result).not.toBe(-0xffffffff1)
  })
})

describe('LCG#next', () => {
  it('次のseedが計算できる', () => {
    expect(next(LCG.from(0xbeefface))).toBe(0x725f6659)
  })

  it('100個先のseedも正しく計算できる', () => {
    expect(next(LCG.from(0xbeefface), 100)).toBe(0x94d35652)
  })

  it('2^32-1個先のseedも正しく計算できる', () => {
    expect(next(LCG.from(0x725f6659), 0xffffffff)).toBe(0xbeefface)
  })
})

describe('LCG#prev', () => {
  it('前のseedが計算できる', () => {
    expect(prev(LCG.from(0x02777fff))).toBe(0x18eb44ec)
  })

  it('prev(n) == next(-n)', () => {
    const seed = LCG.from(0x827827)
    expect(prev(seed)).toBe(next(seed, -1))

    expect(prev(seed, 100)).toBe(next(seed, -100))

    expect(prev(seed, 0xffffffff)).toBe(next(seed, -0xffffffff))
  })
})

describe('LCG#getRand', () => {
  it('乱数を計算し、更新後のseedと一緒に返す', () => {
    const seed = LCG.from(0x7fff8a5d)
    const [rand, nextSeed] = getRand(seed)
    expect(rand).toBe(0xffff)
    expect(nextSeed).toBe(0xffffb3ac)
  })

  it('mod計算に対応している', () => {
    const seed = LCG.from(0x7fff8a5d)
    const [rand] = getRand(seed, 16)
    expect(rand).toBe(15)
  })
})
