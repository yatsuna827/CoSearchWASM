import { LCG } from '@/domain/gc/lcg'

import { generateTogepii } from '../domain/generateTogepii'

import { IndividualPreview } from '../components/IndividualPreview'
import { Label } from '../components/Label'
import { AdjustGapSection } from './AdjustGap'
import { SearchSection } from './Search'

import * as Tabs from '@radix-ui/react-tabs'

type Props = {
  targetSeed: LCG
}
export const PageActivated: React.FC<Props> = ({ targetSeed }) => {
  const individual = targetSeed != null ? generateTogepii(targetSeed) : null

  return (
    <>
      <div className="mb-6">
        <Label className="mb-3">目標seed</Label>
        <span className="block ml-2 leading-none text-[#333]">{LCG.stringify(targetSeed)}</span>
      </div>
      {individual && (
        <div className="mb-2">
          <IndividualPreview individual={individual} />
        </div>
      )}

      <Tabs.Root defaultValue="search">
        <Tabs.List className="h-9 w-full border-b p-0 inline-flex justify-start items-center">
          <Tabs.Trigger
            className="font-semibold text-sm text-[#999]/80 data-[state=active]:text-[#333] px-4 pt-2 pb-3 h-9 inline-flex justify-center items-center border-b-2 border-b-transparent data-[state=active]:border-b-[#333]"
            value="search"
          >
            不定消費計算
          </Tabs.Trigger>
          <Tabs.Trigger
            className="font-semibold text-sm text-[#999]/80 data-[state=active]:text-[#333] px-4 pt-2 pb-3 h-9 inline-flex justify-center items-center border-b-2 border-b-transparent data-[state=active]:border-b-[#333]"
            value="list"
          >
            ずれ確認
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content className="data-[state=inactive]:hidden" value="search" forceMount>
          <SearchSection targetSeed={targetSeed} />
        </Tabs.Content>
        <Tabs.Content className="data-[state=inactive]:hidden" value="list" forceMount>
          <AdjustGapSection />
        </Tabs.Content>
      </Tabs.Root>
    </>
  )
}
