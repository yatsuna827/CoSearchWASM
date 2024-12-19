import { cn } from '@/cn'
import { toJapanese } from '@/domain/nature'
import type { generateTogepii } from '../domain/generateTogepii'
import { AttributesBlock } from './AttributesBlock'
import { Label } from './Label'
import { LabeledText } from './LabeledText'

type Individual = ReturnType<typeof generateTogepii>

type Props = {
  individual: Individual
}
export const IndividualPreview: React.FC<Props> = ({ individual }) => {
  return (
    <div
      className={cn(
        'grid gap-y-2 gap-x-6',
        "[grid-template-areas:'ivs_pid''stats_other'] grid-cols-[150px_1fr]",
        "max-sm:[grid-template-areas:'ivs''stats''pid''other'] max-sm:grid-cols-[1fr]",
      )}
    >
      <div className="[grid-area:ivs] h-12">
        <Label className="mb-1">個体値</Label>
        <AttributesBlock attributes={individual.ivs} pad={2} />
      </div>

      <div className="[grid-area:stats] h-12">
        <Label className="mb-1">実数値</Label>
        <AttributesBlock attributes={individual.stats} />
      </div>

      <div className="[grid-area:pid] h-12">
        <LabeledText
          label="性格値"
          text={individual.pid.toString(16).padStart(8, '0').toUpperCase()}
        />
      </div>

      <div className="[grid-area:other] h-12 flex gap-4">
        <LabeledText
          className="mb-2 w-8"
          label="性別"
          text={(individual.pid & 0xff) < 0x1f ? '♀' : '♂'}
        />
        <LabeledText className="mb-2" label="性格" text={toJapanese(individual.nature)} />
        <LabeledText
          className="mb-2"
          label="特性"
          text={['はりきり', 'てんのめぐみ'][individual.pid % 2]}
        />
        <LabeledText
          className="mb-2"
          label="XD特性"
          text={['はりきり', 'てんのめぐみ'][individual.gcAbility]}
        />
      </div>
    </div>
  )
}
