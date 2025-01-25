import { useMemo, useState } from 'react'
import type { MetaFunction } from 'react-router'

import { cn } from '@/cn'
import { Container } from '@/components/Container'
import { getRand, next } from '@/domain/gc/lcg'
import { useSeedInput } from '@/hooks/useSeedInput'
import { Ref } from '@/utilities/ref'
import { type BingoPanel, data } from './bingo'
import { solve } from './solver'

export const meta: MetaFunction = () => {
  return [
    { title: 'Pokemon XD BattleBingo' },
    { name: 'description', content: 'ポケモンXDのバトルDEビンゴ攻略ツールです' },
  ]
}

const pokeName = {
  exeggutor: 'ナッシー',
  houndoom: 'ヘルガー',
  lunatone: 'ルナトーン',
  anyone: '(誰でも)',
}

const Page: React.FC = () => {
  const [seed, controller] = useSeedInput('')
  const [openSheetCount, setOpenSheetCount] = useState(1)

  const bingoCard = useMemo(() => {
    if (seed == null) return data

    const card = [...data]
    const lcg = Ref.from(seed)
    lcg.update(next, 2 + 70 * openSheetCount)

    for (let i = 0; i < 16; i++) {
      const r = lcg.apply(getRand, 16)
      ;[card[i], card[r]] = [card[r], card[i]]
    }

    return card
  }, [seed, openSheetCount])

  const result = useMemo(() => {
    const result = solve(bingoCard)
    if (result.length === 0) return null
    return result[0].strategy.map(
      ({ panel, entry, epAllocation }) =>
        `${panel.name} ${pokeName[entry]}をエントリー${
          epAllocation ? ` EP配分: ${epAllocation.map((p) => pokeName[p]).join(',')}` : ''
        }`,
    )
  }, [bingoCard])

  return (
    <>
      <div className="sticky top-0 flex items-center justify-center px-4 h-14 border-b bg-white">
        <h1 className="text-lg font-semibold">バトル DE ビンゴ</h1>
      </div>

      <Container>
        <div className="mb-4">
          <label>
            <span className="block text-sm text-[#333]/80 mb-1 select-none">受付時のseed</span>
            <input className="px-2" placeholder="1234ABCD" {...controller} />
          </label>
        </div>

        <div className="mb-4">
          <label>
            <span className="block text-sm text-[#333]/80 mb-1 select-none">
              シートを開いた回数
            </span>
            <input
              className="px-2"
              type="number"
              min={1}
              value={openSheetCount}
              onChange={(e) => {
                const v = Number.parseInt(e.target.value)
                setOpenSheetCount(Number.isInteger(v) && v >= 1 ? v : 1)
              }}
            />
          </label>
        </div>

        <div className="flex gap-12">
          <BingoSheetContainer>
            {bingoCard.map((p) => (
              <BingoSheetCell key={p.name} panel={p} />
            ))}
          </BingoSheetContainer>

          <div>
            {result ? (
              <ul className="list-decimal">
                {result.map((row, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  <li key={i}>{row}</li>
                ))}
              </ul>
            ) : (
              'クリアできません'
            )}
          </div>
        </div>
      </Container>
    </>
  )
}

const BingoSheetContainer: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="grid grid-cols-[repeat(4,96px)] grid-rows-[repeat(4,96px)] gap-2">
      {children}
    </div>
  )
}

const bonusName = {
  'EP+1': 'EP+1',
  'EP+2': 'EP+2',
  マスターボール: 'マスボ',
} as const
const BingoSheetCell: React.FC<{ panel: BingoPanel }> = ({ panel }) => {
  const [state, setState] = useState(false)
  return (
    <div
      className={cn(
        'border-4 rounded-md',
        'size-full',
        'grid justify-center items-start',
        'select-none',
        'cursor-pointer',
        panel.kind === 'bonus' && 'font-bold',
        state && 'bg-gray-300 text-gray-400',
      )}
      onClick={() => setState((v) => !v)}
    >
      {panel.kind === 'bonus' ? bonusName[panel.name] : panel.name}
    </div>
  )
}

export default Page
