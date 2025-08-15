import { cn } from '@/cn'
import { generateStaticSymbol } from '@/domain/gba/generators/individual'
import { IVs, SchemeName, popularName } from '@/domain/gba/generators/ivs'
import { LCG, next } from '@/domain/gba/lcg'
import { natures, toJapanese } from '@/domain/nature'
import { Attributes } from '@/domain/type'
import { Ref } from '@/utilities/ref'
import { useAtomCallback } from 'jotai/utils'
import { useCallback, useState } from 'react'
import type { MetaFunction } from 'react-router'
import { ConditionsBlock } from './components'
import { conditionStateAtom } from './components/ConditionsBlock'

export const meta: MetaFunction = () => {
  return [{ title: '3genSearch' }, { name: 'description', content: '' }]
}

const Page: React.FC = () => {
  const [result, setResult] = useState<ResultRecord[]>([])
  const handleClick = useAtomCallback(
    useCallback((get) => {
      const condition = get(conditionStateAtom)
      if (!condition) return

      const { initialSeed, frame, ivsScheme } = condition
      if (initialSeed.mode !== 'fixed') return // TODO: impl

      const g = generateStaticSymbol(ivsScheme)

      const lcg = Ref.from(next(initialSeed.value, frame.range[0]))
      const result: ResultRecord[] = []
      for (let f = frame.range[0]; f <= frame.range[1]; f++) {
        const [individual] = lcg.map(g)
        result.push({
          initialSeed: initialSeed.value,
          seed: lcg.unwrap(),
          frame: f,
          gap: f - frame.target,
          pid: individual.pid,
          ivs: individual.ivs,
          ivsScheme,

          name: 'ヌオー',
          level: 50,
          stats: [0, 0, 0, 0, 0, 0],
          ability: 'しめりけ',
          gender: '-',
          hiddenPower: '氷70',
        })

        lcg.update(next)
      }

      setResult(result)
    }, []),
  )

  return (
    <div className="px-4 pb-4 grid size-full overflow-hidden grid-rows-[32px_minmax(0,1fr)_fit-content(100%)] gap-2">
      <div>
        <h1>3genSearch</h1>
      </div>

      <div className="flex size-full justify-start items-start overflow-y-auto">
        <ResultTable result={result} />
      </div>

      <div className="grid grid-cols-3 size-full">
        <ConditionsBlock />
        <FilterBlock />
        <ExecuteBlock onExecude={handleClick} />
      </div>
    </div>
  )
}

type ResultRecord = {
  initialSeed: LCG
  frame: number
  gap: number
  seed: LCG
  name: string
  level: number
  pid: number
  ivs: IVs
  ivsScheme: SchemeName
  gender: string
  ability: string
  stats: Attributes
  hiddenPower: string
}

const ResultTable: React.FC<{ result: ResultRecord[] }> = ({ result }) => {
  return (
    <table
      className={cn(
        'grid size-full',
        'grid-cols-[repeat(3,minmax(0,1fr))_90px_80px_40px_90px_80px_repeat(6,32px)_repeat(3,minmax(0,1fr))_repeat(6,32px)_minmax(0,1fr)]',
        'grid-rows-[24px_minmax(0,1fr)]',
        'border-x',
        '[&:not(:first-child)]:[&_tr]:border-t',
        '[&:not(:first-child)]:[&_th]:border-l',
        '[&:not(:first-child)]:[&_td]:border-l',
        // reset default table styles
        'border-collapse',
        'border-spacing-0',
        ['[&_tr]:grid', '[&_tr]:grid-cols-subgrid', '[&_tr]:col-span-full'],
        ['[&_thead]:grid', '[&_thead]:grid-cols-subgrid', '[&_thead]:col-span-full'],
        ['[&_tbody]:grid', '[&_tbody]:grid-cols-subgrid', '[&_tbody]:col-span-full'],
        ['[&_tfoot]:grid', '[&_tfoot]:grid-cols-subgrid', '[&_tfoot]:col-span-full'],
        ['[&_th]:block', '[&_th]:px-1', '[&_th]:py-0', '[&_th]:align-top', '[&_th]:text-left'],
        ['[&_td]:block', '[&_td]:px-1', '[&_td]:py-0', '[&_td]:align-top', '[&_td]:text-left'],
      )}
    >
      <thead className="border-b border-t bg-white h-6">
        <tr>
          <th>初期seed</th>
          <th>F</th>
          <th>ずれ</th>
          <th>seed</th>
          <th>ポケモン</th>
          <th>Lv.</th>
          <th>性格値</th>
          <th>性格</th>
          <th>H</th>
          <th>A</th>
          <th>B</th>
          <th>C</th>
          <th>D</th>
          <th>S</th>
          <th>メソッド</th>
          <th>性別</th>
          <th>特性</th>
          <th>H</th>
          <th>A</th>
          <th>B</th>
          <th>C</th>
          <th>D</th>
          <th>S</th>
          <th>めざパ</th>
        </tr>
      </thead>
      <tbody className="border-b bg-gray-300 overflow-auto">
        {result.map((result, i) => {
          return (
            <tr key={i} className="bg-white [&:nth-child(odd)]:bg-yellow-100">
              <td>{result.initialSeed.toString(16).toUpperCase().padStart(4, '0')}</td>
              <td>{result.frame}</td>
              <td>{result.gap}</td>
              <td>{LCG.stringify(result.seed)}</td>
              <td>{result.name}</td>
              <td>{result.level}</td>
              <td>{result.pid.toString(16).toUpperCase().padStart(8, '4')}</td>
              <td>{toJapanese(natures[result.pid % 25])}</td>
              <td>{result.ivs[0]}</td>
              <td>{result.ivs[1]}</td>
              <td>{result.ivs[2]}</td>
              <td>{result.ivs[3]}</td>
              <td>{result.ivs[4]}</td>
              <td>{result.ivs[5]}</td>
              <td>{popularName[result.ivsScheme]}</td>
              <td>{result.gender}</td>
              <td>{result.ability}</td>
              <td>{result.stats[0]}</td>
              <td>{result.stats[1]}</td>
              <td>{result.stats[2]}</td>
              <td>{result.stats[3]}</td>
              <td>{result.stats[4]}</td>
              <td>{result.stats[5]}</td>
              <td>{result.hiddenPower}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ---

const FilterBlock: React.FC = () => {
  return (
    <div className="flex size-full border p-2">
      <div className="grid size-full">
        <SpeciesSelect />
        <LevelInput />
        <IVsInput />
        <NatureSelect />
        <AbilitySelect />
        <GenderSelect />
        <HiddenPowerInput />
        <ShinyInput />
      </div>
    </div>
  )
}

const SpeciesSelect: React.FC = () => {
  return (
    <div>
      <input className="border" />
    </div>
  )
}
const LevelInput: React.FC = () => {
  return (
    <div>
      <span>Lv.</span>
      <input type="number" className="border w-16 pl-1" />
    </div>
  )
}
const IVsInput: React.FC = () => {
  return (
    <div>
      <div>
        <span>H</span>
        <input type="number" className="border w-16 pl-1" />
        <span>～</span>
        <input type="number" className="border w-16 pl-1" />
      </div>

      <div>
        <span>A</span>
        <input type="number" className="border w-16 pl-1" />
        <span>～</span>
        <input type="number" className="border w-16 pl-1" />
      </div>

      <div>
        <span>B</span>
        <input type="number" className="border w-16 pl-1" />
        <span>～</span>
        <input type="number" className="border w-16 pl-1" />
      </div>

      <div>
        <span>C</span>
        <input type="number" className="border w-16 pl-1" />
        <span>～</span>
        <input type="number" className="border w-16 pl-1" />
      </div>

      <div>
        <span>D</span>
        <input type="number" className="border w-16 pl-1" />
        <span>～</span>
        <input type="number" className="border w-16 pl-1" />
      </div>

      <div>
        <span>S</span>
        <input type="number" className="border w-16 pl-1" />
        <span>～</span>
        <input type="number" className="border w-16 pl-1" />
      </div>
    </div>
  )
}
const NatureSelect: React.FC = () => {
  return (
    <div>
      <select defaultValue={natures[0]}>
        {natures.map((nature) => (
          <option key={nature} value={nature}>
            {toJapanese(nature)}
          </option>
        ))}
      </select>
    </div>
  )
}
const AbilitySelect: React.FC = () => {
  return (
    <div>
      <select>
        <option>しんりょく</option>
      </select>
    </div>
  )
}
const GenderSelect: React.FC = () => {
  return (
    <div>
      <select>
        <option>♂</option>
        <option>♀</option>
      </select>
    </div>
  )
}
const HiddenPowerInput: React.FC = () => {
  return (
    <div>
      <span>めざパ</span>
      <select>
        <option>こおり</option>
        <option>ほのお</option>
        <option>くさ</option>
        <option>かくとう</option>
        <option>ゴースト</option>
      </select>
      <input type="number" defaultValue={30} className="border w-16 pl-1" />
      <span>～</span>
    </div>
  )
}
const ShinyInput: React.FC = () => {
  return (
    <div>
      <span>色違いのみ</span>
      <input type="checkbox" />

      <span>表ID</span>
      <input className="border w-24 pl-1" />
      <span>裏ID</span>
      <input className="border w-24 pl-1" />
    </div>
  )
}

// ---

const ExecuteBlock: React.FC<{ onExecude: () => void }> = ({ onExecude }) => {
  return (
    <div className="flex size-full border p-2">
      <div className="grid size-full">
        <VersionSelect />

        <button type="button" onClick={onExecude} className="border w-16 h-8">
          検索
        </button>
      </div>
    </div>
  )
}

const VersionSelect: React.FC = () => {
  return (
    <div>
      <select defaultValue="em">
        <option value="r">ルビー</option>
        <option value="s">サファイア</option>
        <option value="em">エメラルド</option>
        <option value="fr">ファイアレッド</option>
        <option value="lg">リーフグリーン</option>
      </select>
    </div>
  )
}

export default Page
