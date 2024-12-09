import { LCG } from '@/domain/gc/lcg'
import { toJapanese } from '@/domain/nature'

import { generateTogepii } from '../domain/generateTogepii'

import { AdjustGapSection } from './AdjustGap'
import { SearchSection } from './Search'

type Props = {
  targetSeed: LCG
}
export const PageActivated: React.FC<Props> = ({ targetSeed }) => {
  const individual = targetSeed != null ? generateTogepii(targetSeed) : null

  return (
    <>
      <div>目標seed: {LCG.stringify(targetSeed)}</div>
      {individual && (
        <div className="px-2">
          <span className="mr-2">{toJapanese(individual.nature)}</span>
          <span className="mr-2">
            {individual.ivs.map((_) => _.toString().padStart(2, '0')).join('-')}
          </span>
          <span className="mr-2">({individual.stats.join('-')})</span>
        </div>
      )}

      <SearchSection targetSeed={targetSeed} />
      <AdjustGapSection />
    </>
  )
}
