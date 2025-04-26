import type { MetaFunction } from 'react-router'

import { Container } from '@/components/Container'
import { LabeledInput } from '@/components/LabeledInput'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/Table'
import { LCG, next, prev } from '@/domain/gc/lcg'
import { useSeedInput } from '@/hooks/useSeedInput'
import { Ref } from '@/utilities/ref'
import { useMemo } from 'react'
import { generateDirection } from './domain/npc'

export const meta: MetaFunction = () => {
  return [
    { title: 'Pokemon Colosseum Blink offset ' },
    {
      name: 'description',
      content:
        'ポケモンコロシアムで、パイラタウンのNPCの動きを利用して瞬きオフセットを特定するツールです',
    },
  ]
}

const Page: React.FC = () => {
  const [seed, controller] = useSeedInput('')
  const dirList = useMemo(() => {
    if (seed == null) return null

    const result: [LCG, number][] = []

    const lcg = Ref.from(prev(seed, 10))
    for (let i = 0; i <= 31; i++) {
      const [dir] = lcg.map(generateDirection)
      result.push([lcg.unwrap(), dir])

      lcg.update(next)
    }

    return result
  }, [seed])

  return (
    <>
      <div className="sticky top-0 flex items-center justify-center px-4 h-14 border-b bg-white z-50">
        <h1 className="text-lg font-semibold">ポケモンコロシアム 瞬きオフセット特定</h1>
      </div>

      <Container className="flex flex-col">
        <LabeledInput
          className="px-2 mb-4"
          label="目標seed"
          placeholder="1234ABCD"
          {...controller}
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16" />
              <TableHead className="w-32">Seed</TableHead>
              <TableHead>Direction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dirList?.map(([s, dir], i) => {
              return (
                <TableRow key={s}>
                  <TableCell>{i - 10}</TableCell>
                  <TableCell>{LCG.stringify(s)}</TableCell>
                  <TableCell>
                    <Arrow dir={dir} size={64} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Container>
    </>
  )
}
type ArrowProps = {
  dir: number // 0 ~ 2πのラジアン
  size?: number
}
const Arrow: React.FC<ArrowProps> = ({ dir, size = 100 }) => {
  const degrees = -((dir * 180) / Math.PI + 180)

  return (
    <svg
      viewBox="0 0 100 100"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `rotate(${degrees}deg)`,
        transformOrigin: 'center',
      }}
    >
      {/* 外周円：針より細い線 */}
      <circle cx="50" cy="50" r="45" stroke="black" strokeWidth="1" fill="none" />
      {/* 中心点 */}
      <circle cx="50" cy="50" r="3" fill="black" />
      {/* 針本体 */}
      <line x1="50" y1="50" x2="50" y2="15" stroke="black" strokeWidth="3" strokeLinecap="round" />
      {/* 矢印の頭 */}
      <polygon points="50,5 46,15 54,15" fill="black" />
    </svg>
  )
}

export default Page
