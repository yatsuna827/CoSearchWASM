import { LCG } from '@/domain/gc/lcg'

import { generateTogepii } from '../domain/generateTogepii'

import { toJapanese } from '@/domain/nature'
import { AttributesBlock } from '../components/AttributesBlock'
import { IndividualPreview } from '../components/IndividualPreview'
import { Label } from '../components/Label'
import { LabeledText } from '../components/LabeledText'
import { AdjustGapSection } from './AdjustGap'
import { SearchSection } from './Search'

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
      {individual && <IndividualPreview individual={individual} />}

      <SearchSection targetSeed={targetSeed} />
      <AdjustGapSection />
    </>
  )
}
