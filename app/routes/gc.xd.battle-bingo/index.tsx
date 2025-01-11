import { useMemo, useState } from 'react'
import type { MetaFunction } from 'react-router'

import { cn } from '@/cn'
import { Container } from '@/components/Container'
import { Table, TableBody, TableCell, TableRow } from '@/components/Table'
import { getRand, next } from '@/domain/gc/lcg'
import { useSeedInput } from '@/hooks/useSeedInput'
import { Ref } from '@/utilities/ref'
import { type BingoPanel, data } from './bingo'

export const meta: MetaFunction = () => {
  return [
    { title: 'Pokemon XD BattleBingo' },
    { name: 'description', content: 'ポケモンXDのバトルDEビンゴ攻略ツールです' },
  ]
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

  // biome-ignore format:
  const [
     p0,  p1,  p2,  p3,
     p4,  p5,  p6,  p7,
     p8,  p9, p10, p11,
    p12, p13, p14, p15,
  ] = bingoCard

  return (
    <>
      <div className="sticky top-0 flex items-center justify-center px-4 h-14 border-b bg-white">
        <h1 className="text-lg font-semibold">Pokemon GC LCG</h1>
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

        <Table>
          <TableBody>
            <TableRow>
              <PanelCell panel={p0} />
              <PanelCell panel={p1} />
              <PanelCell panel={p2} />
              <PanelCell panel={p3} />
            </TableRow>
            <TableRow>
              <PanelCell panel={p4} />
              <PanelCell panel={p5} />
              <PanelCell panel={p6} />
              <PanelCell panel={p7} />
            </TableRow>
            <TableRow>
              <PanelCell panel={p8} />
              <PanelCell panel={p9} />
              <PanelCell panel={p10} />
              <PanelCell panel={p11} />
            </TableRow>
            <TableRow>
              <PanelCell panel={p12} />
              <PanelCell panel={p13} />
              <PanelCell panel={p14} />
              <PanelCell panel={p15} />
            </TableRow>
          </TableBody>
        </Table>
      </Container>
    </>
  )
}

const PanelCell: React.FC<{ panel: BingoPanel }> = ({ panel }) => {
  return (
    <TableCell className={cn(panel.kind === 'bonus' && 'font-bold')}>
      {panel.kind === 'bonus' ? panel.type : panel.name}
    </TableCell>
  )
}

export default Page
