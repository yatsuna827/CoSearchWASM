import { LCG, getRand } from '@/domain/gba/lcg'
import { Ref } from '@/utilities/ref'

export const generateCry = (seed: LCG): [string, LCG] => {
  const lcg = Ref.from(seed)
  const r = lcg.apply(getRand, 100)
  const name = lcg.apply(r < 80 ? generateGrassCry : generateSurfCry)
  return [name, lcg.unwrap()]
}

const table_grass = [
  'ポッポ',
  'ナゾノクサ',
  'ポッポ',
  'クサイハナ',
  'ピジョン',
  'ニャース',
  'コンパン',
  'コダック',
  'ピジョン',
  'ペルシアン',
  'ピジョン',
  'ペルシアン',
]
const generateGrassCry = (seed: LCG): [string, LCG] => {
  const lcg = Ref.from(seed)
  const r = lcg.apply(getRand, 100)
  if (r < 20) return [table_grass[0], lcg.unwrap()]
  if (r < 40) return [table_grass[1], lcg.unwrap()]
  if (r < 50) return [table_grass[2], lcg.unwrap()]
  if (r < 60) return [table_grass[3], lcg.unwrap()]
  if (r < 70) return [table_grass[4], lcg.unwrap()]
  if (r < 80) return [table_grass[5], lcg.unwrap()]
  if (r < 85) return [table_grass[6], lcg.unwrap()]
  if (r < 90) return [table_grass[7], lcg.unwrap()]
  if (r < 94) return [table_grass[8], lcg.unwrap()]
  if (r < 98) return [table_grass[9], lcg.unwrap()]
  if (r < 99) return [table_grass[10], lcg.unwrap()]
  return [table_grass[11], lcg.unwrap()]
}

const table_surf = ['メノクラゲ', 'メノクラゲ', 'メノクラゲ', 'ドククラゲ', 'ドククラゲ']
const generateSurfCry = (seed: LCG): [string, LCG] => {
  const lcg = Ref.from(seed)
  const r = lcg.apply(getRand, 100)
  if (r < 60) return [table_surf[0], lcg.unwrap()]
  if (r < 90) return [table_surf[1], lcg.unwrap()]
  if (r < 95) return [table_surf[2], lcg.unwrap()]
  if (r < 99) return [table_surf[3], lcg.unwrap()]
  return [table_surf[4], lcg.unwrap()]
}
