import type { MetaFunction } from 'react-router'

import { Container } from '@/components/Container'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/Table'
import { LCG, getRand } from '@/domain/gc/lcg'
import { useSeedInput } from '@/hooks/useSeedInput'
import { Ref } from '@/utilities/ref'
import { useMemo, useState } from 'react'

export const meta: MetaFunction = () => {
  return [
    { title: 'Pokemon Co/XD LCG' },
    { name: 'description', content: 'ポケモンコロシアム・XDのLCGリストツールです。' },
  ]
}

const Page: React.FC = () => {
  const [seed, controller] = useSeedInput('CAFE0827')
  const [customFnBody, setCustomFnBody] = useState('')
  const [filterFnBody, setFilterFnBody] = useState('')
  const [n, setN] = useState('100')

  const list = useMemo(() => {
    if (seed == null) return []
    const np = Number(n)
    if (!Number.isInteger(np) || np < 0) return []

    const a = []
    const lcg = Ref.from(seed)
    for (let i = 0; i <= np; i++) {
      const s = lcg.unwrap()
      const r = lcg.apply(getRand)
      a.push([s, r] as const)
    }
    return a
  }, [seed, n])

  const customFn = useMemo(() => {
    if (!customFnBody.trim()) return null

    try {
      const fn = new Function('s', 'r', 'i', `return ${customFnBody}`)
      return (s: number, r: number, i: number) => {
        try {
          return fn(s, r, i)
        } catch (e) {
          return `${e}`
        }
      }
    } catch {
      return null
    }
  }, [customFnBody])
  const filterFn = useMemo(() => {
    if (!filterFnBody.trim()) return null

    try {
      const fn = new Function('s', 'r', 'i', 'c', `return ${filterFnBody}`)
      return (s: number, r: number, i: number, c: unknown) => {
        try {
          return !!fn(s, r, i, c)
        } catch {
          return false
        }
      }
    } catch {
      return null
    }
  }, [filterFnBody])

  return (
    <>
      <div className="sticky top-0 flex items-center justify-center px-4 h-14 border-b bg-white">
        <h1 className="text-lg font-semibold">Pokemon GC LCG</h1>
      </div>

      <Container>
        <div className="mb-4">
          <label>
            <span className="block text-sm text-[#333]/80 mb-1 select-none">seed</span>
            <input className="px-2" placeholder="1234ABCD" {...controller} />
          </label>
        </div>

        <div className="mb-4">
          <input className="px-2 w-32" type="number" value={n} onChange={(e) => setN(e.target.value)} />
        </div>

        <div className="font-mono mb-4">
          <span>{'function Custom(s,r,i) { return `${'}</span>
          <input
            className="px-2 mx-1"
            placeholder="r % 100"
            value={customFnBody}
            onChange={(e) => setCustomFnBody(e.target.value)}
          />
          <span>{'}` }'}</span>
        </div>

        <div className="font-mono mb-4">
          <span>{'function Filter(s,r,i,c) { return !!('}</span>
          <input
            className="px-2 mx-1"
            placeholder="c === 0"
            value={filterFnBody}
            onChange={(e) => setFilterFnBody(e.target.value)}
          />
          <span>{') }'}</span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16" />
              <TableHead className="w-32">Seed</TableHead>
              <TableHead className="w-16">Rand</TableHead>
              <TableHead>Custom</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map(([s, r], i) => {
              const c = customFn ? `${customFn(s, r, i)}` : null

              if (filterFn && !filterFn(s, r, i, c)) return null

              return (
                <TableRow key={s}>
                  <TableCell>{i}</TableCell>
                  <TableCell>{LCG.stringify(s)}</TableCell>
                  <TableCell>{r.toString(16).toUpperCase()}</TableCell>

                  <TableCell>{c ?? '-'}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Container>
    </>
  )
}

export default Page
