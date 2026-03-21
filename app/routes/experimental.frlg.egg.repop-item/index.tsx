import { useMemo, useState } from 'react'
import type { MetaFunction } from 'react-router'

import { cn } from '@/cn'
import { Container } from '@/components/Container'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/Table'
import { type Compatibility, generateEggHolding } from '@/domain/gba/frlg/egg'
import { type ItemCategory, generateRepopItem } from '@/domain/gba/frlg/repopItem'
import { LCG, next } from '@/domain/gba/lcg'
import { Ref } from '@/utilities/ref'
import { generateCry } from './generators/cry'

export const meta: MetaFunction = () => [
  { title: 'FRLG タマゴ生成' },
  { name: 'description', content: 'FRLGの復活アイテム判定を利用したタマゴ生成のリストツールです。' },
]

const Page: React.FC = () => {
  const [seedRaw, setSeedRaw] = useState('0000')
  const [targetRaw, setTargetRaw] = useState('2500')
  const [rangeRaw, setRangeRaw] = useState('500')

  const [movementMethod, setMovementMethod] = useState<MovementMethod>('walk')
  const frameOffset = MOVEMENT_OFFSETS[movementMethod]
  const [isSwitch, setIsSwitch] = useState(false)
  const [compatibility, setCompatibility] = useState<Compatibility>('NotBad')

  const seed = useMemo(() => LCG.tryParse(seedRaw), [seedRaw])
  const target = useMemo(() => {
    const n = Number(targetRaw)
    return Number.isInteger(n) && n >= 0 ? n : null
  }, [targetRaw])
  const range = useMemo(() => {
    const n = Number(rangeRaw)
    return Number.isInteger(n) && n > 0 ? n : null
  }, [rangeRaw])

  const rows = useMemo(() => {
    if (seed == null || target == null || range == null) return []

    const eggOffset = frameOffset * (isSwitch ? 2 : 1) + 3
    const genEggHolding = generateEggHolding(compatibility)

    const startIndex = Math.max(0, target - range)
    const endIndex = target + range

    const lcg = Ref.from(seed)
    lcg.update(next, startIndex)

    const result = []
    for (let i = startIndex; i <= endIndex; i++, lcg.update(next)) {
      const rowSeed = lcg.unwrap()
      const innerLcg = Ref.from(rowSeed)

      const cry = innerLcg.apply(generateCry)
      const items = Array.from({ length: 15 }, () => innerLcg.apply(generateRepopItem))
      innerLcg.update(next, eggOffset)
      const eggHolding = innerLcg.apply(genEggHolding)

      result.push({ index: i, seed: rowSeed, cry, items, eggHolding })
    }
    return result
  }, [seed, target, range, frameOffset, isSwitch, compatibility])

  return (
    <>
      <div className="sticky top-0 flex items-center justify-center px-4 h-14 border-b bg-white z-10">
        <h1 className="text-lg font-semibold">FRLG タマゴ生成</h1>
      </div>

      <Container>
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex gap-4 items-end">
            <label>
              <span className="block text-sm text-[#333]/80 mb-1 select-none">Seed</span>
              <input
                className="px-2 font-mono w-32"
                placeholder="00000000"
                value={seedRaw}
                onChange={(e) => setSeedRaw(e.target.value)}
              />
            </label>

            <label>
              <span className="block text-sm text-[#333]/80 mb-1 select-none">目標消費数</span>
              <input
                className="px-2 w-28"
                type="number"
                min={0}
                value={targetRaw}
                onChange={(e) => setTargetRaw(e.target.value)}
              />
            </label>

            <label>
              <span className="block text-sm text-[#333]/80 mb-1 select-none">±</span>
              <input
                className="px-2 w-20"
                type="number"
                min={1}
                max={500}
                value={rangeRaw}
                onChange={(e) => setRangeRaw(e.target.value)}
              />
            </label>
          </div>

          <div className="flex gap-4 items-end">
            <div>
              <span className="block text-sm text-[#333]/80 mb-1 select-none">バージョン</span>
              <div className="flex gap-2">
                {([false, true] as const).map((sw) => (
                  <button
                    key={String(sw)}
                    type="button"
                    className={cn(
                      'px-3 py-1 text-sm border rounded',
                      isSwitch === sw
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-[#333] border-[#ccc] hover:border-[#999]',
                    )}
                    onClick={() => setIsSwitch(sw)}
                  >
                    {sw ? 'Switch' : 'GBA'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-sm text-[#333]/80 mb-1 select-none">移動方法</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={cn(
                    'px-3 py-1 text-sm border rounded',
                    movementMethod === 'walk'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-[#333] border-[#ccc] hover:border-[#999]',
                  )}
                  onClick={() => setMovementMethod('walk')}
                >
                  {MOVEMENT_LABELS.walk}
                </button>
                <button
                  type="button"
                  className={cn(
                    'px-3 py-1 text-sm border rounded',
                    movementMethod === 'dash'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-[#333] border-[#ccc] hover:border-[#999]',
                  )}
                  onClick={() => setMovementMethod('dash')}
                >
                  {MOVEMENT_LABELS.dash}
                </button>
                <button
                  type="button"
                  className={cn(
                    'px-3 py-1 text-sm border rounded',
                    movementMethod === 'bike'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-[#333] border-[#ccc] hover:border-[#999]',
                  )}
                  onClick={() => setMovementMethod('bike')}
                >
                  {MOVEMENT_LABELS.bike}
                </button>
              </div>
            </div>

            <div>
              <span className="block text-sm text-[#333]/80 mb-1 select-none">相性</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={cn(
                    'px-3 py-1 text-sm border rounded',
                    compatibility === 'NotBad'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-[#333] border-[#ccc] hover:border-[#999]',
                  )}
                  onClick={() => setCompatibility('NotBad')}
                >
                  {COMPATIBILITY_LABELS.NotBad}
                </button>
                <button
                  type="button"
                  className={cn(
                    'px-3 py-1 text-sm border rounded',
                    compatibility === 'Good'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-[#333] border-[#ccc] hover:border-[#999]',
                  )}
                  onClick={() => setCompatibility('Good')}
                >
                  {COMPATIBILITY_LABELS.Good}
                </button>
                <button
                  type="button"
                  className={cn(
                    'px-3 py-1 text-sm border rounded',
                    compatibility === 'VeryWell'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-[#333] border-[#ccc] hover:border-[#999]',
                  )}
                  onClick={() => setCompatibility('VeryWell')}
                >
                  {COMPATIBILITY_LABELS.VeryWell}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center align-bottom sticky left-0 bg-white z-10">消費</TableHead>
                <TableHead className="w-28 align-bottom">Seed</TableHead>
                <TableHead className="w-24 align-bottom">鳴き声</TableHead>
                {REPOP_MAPS.map((name, i) => (
                  <TableHead key={i} className="text-center px-0 h-36 align-bottom">
                    <span className="inline-block text-xs" style={{ writingMode: 'vertical-rl' }}>
                      {name}
                    </span>
                  </TableHead>
                ))}
                <TableHead className="w-20 align-bottom text-center">LID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ index, seed: rowSeed, cry, items, eggHolding }) => (
                <TableRow key={index}>
                  <TableCell className="text-center sticky left-0 bg-white">{index}</TableCell>
                  <TableCell className="font-mono text-xs">{LCG.stringify(rowSeed)}</TableCell>
                  <TableCell className="text-sm">{cry}</TableCell>
                  {items.map((cat, i) => (
                    <TableCell
                      key={i}
                      className={cn(
                        'text-center px-0 text-sm',
                        cat === 'common' && 'text-gray-400',
                        cat === 'uncommon' && 'text-blue-600',
                        cat === 'rare' && 'text-orange-500 font-bold',
                      )}
                    >
                      {CATEGORY_SYMBOL[cat]}
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    {eggHolding != null ? eggHolding.lid.toString(16).toUpperCase().padStart(4, '0') : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Container>
    </>
  )
}

const CATEGORY_SYMBOL: Record<ItemCategory, string> = {
  common: '○',
  uncommon: '◎',
  rare: '☆',
}

type MovementMethod = 'walk' | 'dash' | 'bike'

const MOVEMENT_LABELS: Record<MovementMethod, string> = {
  walk: '歩行',
  dash: 'ダッシュ',
  bike: '自転車',
}

const MOVEMENT_OFFSETS: Record<MovementMethod, number> = {
  walk: 16,
  dash: 8,
  bike: 6,
}

const COMPATIBILITY_LABELS: Record<Compatibility, string> = {
  NotBad: 'よくない',
  Good: 'まずまず',
  VeryWell: 'とってもいい',
}

const REPOP_MAPS = [
  '20ばんすいどう',
  '21ばんすいどう',
  'ちかつうろ（南北）',
  'ちかつうろ（東西）',
  'アスカナいせき',
  'オツキミやま',
  'きのみのもり',
  'たからのはま',
  'きずなばし',
  '4のしま',
  'おもいでのとう',
  'ゴージャスリゾート',
  'はずれのしま',
  'みどりのさんぽみち',
  'トレーナータワー',
] as const

export default Page
