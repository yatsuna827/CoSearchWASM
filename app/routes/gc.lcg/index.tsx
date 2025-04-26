import { useCallback, useState } from 'react'
import type { MetaFunction } from 'react-router'

import { Tabs } from 'radix-ui'

import { Container } from '@/components/Container'
import { LCG, next } from '@/domain/gc/lcg'
import { useSeedInput } from '@/hooks/useSeedInput'

export const meta: MetaFunction = () => {
  return [
    { title: 'Pokemon Co/XD LCG' },
    { name: 'description', content: 'ポケモンコロシアム・XDのLCG計算ツールです。' },
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
              進める / 戻す
            </Tabs.Trigger>
            <Tabs.Trigger
              className="font-semibold text-sm text-[#999]/80 data-[state=active]:text-[#333] px-4 pt-2 pb-3 h-9 inline-flex justify-center items-center border-b-2 border-b-transparent data-[state=active]:border-b-[#333]"
              value="gap"
            >
              距離の計算
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content className="data-[state=inactive]:hidden" value="advance" forceMount>
            <CalcSeedTab />
          </Tabs.Content>
          <Tabs.Content className="data-[state=inactive]:hidden" value="gap" forceMount>
            <CalcGapTab />
          </Tabs.Content>
        </Tabs.Root>
      </Container>
    </>
  )
}

const CalcSeedTab: React.FC = () => {
  const [seed, controller] = useSeedInput('CAFE0827')
  const [d, setD] = useState('0')
  const handleChangeValue = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setD(e.target.value)
  }, [])

  const dNum = Number(d)
  const after = seed != null && Number.isInteger(dNum) ? next(seed, dNum) : null

  return (
    <>
      <div>
        <label>
          <span className="block text-sm text-[#333]/80 mb-1 select-none">seed</span>
          <input className="px-2" placeholder="1234ABCD" {...controller} />
        </label>
      </div>

      <div className="my-4">
        <span className="mr-2 font-bold">↓</span>
        <input className="px-2 w-32" type="number" value={d} onChange={handleChangeValue} />
      </div>

      <div>{after != null ? LCG.stringify(after) : '入力が不正です'}</div>
    </>
  )
}

const CalcGapTab: React.FC = () => {
  const [seed, controller1] = useSeedInput('CAFE0827')
  const [after, controller2] = useSeedInput('CAFE0827')

  const d = seed != null && after != null ? LCG.getIndex(after, seed) >>> 0 : null

  return (
    <>
      <div>
        <label>
          <span className="block text-sm text-[#333]/80 mb-1 select-none">seed 1</span>
          <input className="px-2" placeholder="1234ABCD" {...controller1} />
        </label>
      </div>

      <div className="my-4">
        <span className="mr-2 font-bold">↓</span>
        <span>{d}</span>
      </div>

      <div>
        <label>
          <span className="block text-sm text-[#333]/80 mb-1 select-none">seed 2</span>
          <input className="px-2" placeholder="1234ABCD" {...controller2} />
        </label>
      </div>
    </>
  )
}

export default Page
