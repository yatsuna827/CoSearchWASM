import type { Attributes } from '@/domain/type'
import { Ref } from '@/utilities/ref'
import { getRand, LCG, next } from '../lcg'

export type IVs = Attributes
export type SchemeName = keyof typeof SCHEME
export const popularName = {
  standard: 'method1',
  roamingBug: '-',
  interruptedPrior: 'method2',
  interruptedMiddle: 'method4',
} satisfies Record<SchemeName, string>

export const generateIVs = (scheme: SchemeName) => SCHEME[scheme]

// Method1
const standard = (seed: LCG): [IVs, LCG] => {
  const lcg = Ref.from(seed)
  const hab = lcg.apply(getRand)
  const scd = lcg.apply(getRand)

  return [toIVs(hab, scd), lcg.unwrap()]
}
// Method4
const interruptedMiddle = (seed: LCG): [IVs, LCG] => {
  const lcg = Ref.from(seed)
  const hab = lcg.apply(getRand)
  lcg.update(next)
  const scd = lcg.apply(getRand)

  return [toIVs(hab, scd), lcg.unwrap()]
}
// Method2
const interruptedPrior = (seed: LCG): [IVs, LCG] => {
  const lcg = Ref.from(seed)
  lcg.update(next)
  const hab = lcg.apply(getRand)
  const scd = lcg.apply(getRand)

  return [toIVs(hab, scd), lcg.unwrap()]
}

// Em以外の徘徊
const roamingBug = (seed: LCG): [IVs, LCG] => {
  const lcg = Ref.from(seed)
  const hab = lcg.apply(getRand)
  const _ = lcg.apply(getRand) // バグにより0で上書きされる

  return [[(hab >>> 0) & 0x1f, (hab >>> 5) & 0x7, 0, 0, 0, 0], lcg.unwrap()]
}

const SCHEME = {
  standard,
  interruptedMiddle,
  interruptedPrior,
  roamingBug,
} as const

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

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest

  test('メソッド1個体値生成の互換性テスト', () => {
    const [ivs] = standard(LCG.from(0xbeef))
    expect(ivs).toEqual([24, 18, 5, 15, 19, 6])
  })

  test('徘徊バグ生成の互換性テスト', () => {
    const [ivs] = roamingBug(LCG.from(0x2a2bc274))
    expect(ivs).toEqual([25, 4, 0, 0, 0, 0])
  })
}
