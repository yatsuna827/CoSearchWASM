import type { MetaFunction } from 'react-router'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select'
import { Tabs } from 'radix-ui'

import { Checkbox } from '@/components/CheckBox'
import { Container } from '@/components/Container'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/Table'
import { LCG, next } from '@/domain/gc/lcg'
import { natures, toJapanese } from '@/domain/nature'
import { toStats } from '@/domain/stats'
import { useSeedInput } from '@/hooks/useSeedInput'
import {
  type PokeSpotKind,
  generatePokeSpot,
  generatePokemon,
  pokeSpots,
} from '@/routes/gc.xd.pokespot/domain/pokeSpot'
import { Ref } from '@/utilities/ref'
import { useMemo, useState } from 'react'
import { findPath, navigateToPokeSpot } from './domain/advance'

export const meta: MetaFunction = () => {
  return [
    { title: 'Pokemon Co/XD LCG' },
    { name: 'description', content: 'ポケモンコロシアム・XDのLCGリストツールです。' },
  ]
}

const Page: React.FC = () => {
  return (
    <>
      <div className="sticky top-0 flex items-center justify-center px-4 h-14 border-b bg-white">
        <h1 className="text-lg font-semibold">Pokemon GC LCG</h1>
      </div>

      <Container>
        <Tabs.Root defaultValue="advance">
          <Tabs.List className="h-9 mb-4 w-full border-b p-0 inline-flex justify-start items-center">
            <Tabs.Trigger
              className="font-semibold text-sm text-[#999]/80 data-[state=active]:text-[#333] px-4 pt-2 pb-3 h-9 inline-flex justify-center items-center border-b-2 border-b-transparent data-[state=active]:border-b-[#333]"
              value="advance"
            >
              出現 - リスト
            </Tabs.Trigger>
            <Tabs.Trigger
              className="font-semibold text-sm text-[#999]/80 data-[state=active]:text-[#333] px-4 pt-2 pb-3 h-9 inline-flex justify-center items-center border-b-2 border-b-transparent data-[state=active]:border-b-[#333]"
              value="gap"
            >
              個体値 - 消費計算
            </Tabs.Trigger>
            <Tabs.Trigger
              className="font-semibold text-sm text-[#999]/80 data-[state=active]:text-[#333] px-4 pt-2 pb-3 h-9 inline-flex justify-center items-center border-b-2 border-b-transparent data-[state=active]:border-b-[#333]"
              value="list2"
            >
              個体値 - リスト
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content className="data-[state=inactive]:hidden" value="advance" forceMount>
            <ListTab />
          </Tabs.Content>
          <Tabs.Content className="data-[state=inactive]:hidden" value="gap" forceMount>
            <FindPathTab />
          </Tabs.Content>
          <Tabs.Content className="data-[state=inactive]:hidden" value="list2" forceMount>
            <ListTab2 />
          </Tabs.Content>
        </Tabs.Root>
      </Container>
    </>
  )
}

const evToJp = {
  Munchlax: 'ゴンベ',
  Bonsly: 'ウソハチ',
}

const ListTab: React.FC = () => {
  const [seed, controller] = useSeedInput('CAFE0827')
  const [n, setN] = useState('100')

  const list = useMemo(() => {
    if (seed == null) return []
    const np = Number(n)
    if (!Number.isInteger(np) || np < 0) return []

    const a = []
    const lcg = Ref.from(seed)
    lcg.update(next, 14)
    for (let i = 0; i <= np; i++) {
      const s = lcg.unwrap()
      const [r] = lcg.map(generatePokeSpot(pokeSpots.Rock.table, { bonsly: true }))
      a.push([s, r] as const)

      lcg.update(next, 8)
    }
    return a
  }, [seed, n])

  return (
    <>
      <div className="mb-4">
        <label>
          <span className="block text-sm text-[#333]/80 mb-1 select-none">seed</span>
          <input className="px-2" placeholder="1234ABCD" {...controller} />
        </label>
      </div>

      <div className="mb-4">
        <input className="px-2 w-32" type="number" value={n} onChange={(e) => setN(e.target.value)} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16" />
            <TableHead className="w-32">Seed</TableHead>
            <TableHead className="w-16" />
            <TableHead className="w-16" />
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map(([s, r], i) => {
            return (
              <TableRow key={s}>
                <TableCell>{i}</TableCell>
                <TableCell>{LCG.stringify(s)}</TableCell>
                <TableCell>{r.kind}</TableCell>

                <TableCell>{r.kind === 'Appear' ? r.slot.species : r.kind === 'Event' ? evToJp[r.type] : ''}</TableCell>
                <TableCell>{r.kind === 'Appear' ? toJapanese(natures[r.pid % 25]) : ''}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </>
  )
}

const FindPathTab: React.FC = () => {
  const [seed, controller] = useSeedInput('CAFE0827')
  const [current, controller2] = useSeedInput('')

  const [pokeSpot, setPokeSpot] = useState<PokeSpotKind>('Rock')
  const [scooterUpgraded, setScooterUpgraded] = useState(true)

  const result = useMemo<[LCG, fidgets: number][]>(() => {
    if (seed == null) return []

    const opt = { to: pokeSpot, scooterUpgraded } as const
    return findPath(opt)(seed)
  }, [seed, pokeSpot, scooterUpgraded])

  return (
    <>
      <div className="mb-4">
        <label>
          <span className="block text-sm text-[#333]/80 mb-1 select-none">目標seed</span>
          <input className="px-2" placeholder="1234ABCD" {...controller} />
        </label>
      </div>
      <div className="mb-4">
        <label>
          <span className="block text-sm text-[#333]/80 mb-1 select-none">現在のseed</span>
          <input className="px-2" placeholder="1234ABCD" {...controller2} />
        </label>
      </div>

      <Select value={pokeSpot} onValueChange={(v) => setPokeSpot(v as PokeSpotKind)}>
        <SelectTrigger className="w-32 bg-white mb-4">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={'Cave' satisfies PokeSpotKind}>洞窟</SelectItem>
          <SelectItem value={'Rock' satisfies PokeSpotKind}>岩場</SelectItem>
          <SelectItem value={'Oasis' satisfies PokeSpotKind}>オアシス</SelectItem>
        </SelectContent>
      </Select>

      <div className="items-top flex space-x-2 mb-4">
        <Checkbox
          id="check-scooter-upgraded"
          checked={scooterUpgraded}
          onCheckedChange={(c) => setScooterUpgraded(c === true)}
        />
        <label
          htmlFor="check-scooter-upgraded"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none cursor-pointer"
        >
          スクーター改良後
        </label>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-32">Seed</TableHead>
            <TableHead className="w-16">腰振り</TableHead>
            <TableHead className="w-24">残り消費数</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.map(([s, fidgets]) => {
            return (
              <TableRow key={s}>
                <TableCell>{LCG.stringify(s)}</TableCell>
                <TableCell>{fidgets}回</TableCell>
                <TableCell>{current != null && LCG.getIndex(s, current) >>> 0}</TableCell>
                <TableCell />
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </>
  )
}

const ListTab2: React.FC = () => {
  const [seed, controller] = useSeedInput('CAFE0827')
  const [n, setN] = useState('100')

  const list = useMemo(() => {
    if (seed == null) return []
    const np = Number(n)
    if (!Number.isInteger(np) || np < 0) return []

    const a = []
    const lcg = Ref.from(seed)
    const g = navigateToPokeSpot({ to: 'Rock', scooterUpgraded: true })
    const slot = generatePokemon({ ...pokeSpots.Rock.table[1], pid: 0x199ba47c })
    for (let i = 0; i <= np; i++) {
      const s = lcg.unwrap()
      const r = lcg.map((seed) => {
        const lcg = Ref.from(seed)
        lcg.update(next, 2) // ワールドマップ開
        lcg.update(g)
        return lcg.apply(slot)
      })
      a.push([s, r] as const)

      lcg.update(next)
    }
    return a
  }, [seed, n])

  return (
    <>
      <div className="mb-4">
        <label>
          <span className="block text-sm text-[#333]/80 mb-1 select-none">seed</span>
          <input className="px-2" placeholder="1234ABCD" {...controller} />
        </label>
      </div>

      <div className="mb-4">
        <input className="px-2 w-32" type="number" value={n} onChange={(e) => setN(e.target.value)} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16" />
            <TableHead className="w-32">Seed</TableHead>
            <TableHead className="w-16" />
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map(([s, r], i) => {
            const stats = toStats([65, 75, 105, 35, 65, 85], r.ivs, r.lv, natures[r.pid % 25])
            return (
              <TableRow key={s}>
                <TableCell>{i}</TableCell>
                <TableCell>{LCG.stringify(s)}</TableCell>
                <TableCell>Lv.{r.lv}</TableCell>
                <TableCell>{stats.join('-')}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </>
  )
}

export default Page
