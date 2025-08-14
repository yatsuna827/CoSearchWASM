import { natures, toJapanese } from '@/domain/nature'
import React, { useState } from 'react'
import type { MetaFunction } from 'react-router'

export const meta: MetaFunction = () => {
  return [{ title: '3genSearch' }, { name: 'description', content: '' }]
}

const Page: React.FC = () => {
  return (
    <div>
      <div className="h-80">
        <ResultTable />
      </div>

      <div className="grid grid-cols-3">
        <ConditionsBlock />
        <FilterBlock />
        <ExecuteBlock />
      </div>
    </div>
  )
}

const ResultTable: React.FC = () => {
  return (
    <table>
      <thead>
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
      <tbody>
        <tr>
          <td>0x0000</td>
          <td>123456</td>
          <td>-1024</td>
          <td>0xBEEFFACE</td>
          <td>ヌオー</td>
          <td>30</td>
          <td>ABCD1234</td>
          <td>いじっぱり</td>
          <td>31</td>
          <td>31</td>
          <td>31</td>
          <td>0</td>
          <td>31</td>
          <td>31</td>
          <td>メソッド1</td>
          <td>♂</td>
          <td>しめりけ</td>
          <td>999</td>
          <td>999</td>
          <td>999</td>
          <td>99</td>
          <td>999</td>
          <td>99</td>
          <td>氷70</td>
        </tr>
      </tbody>
    </table>
  )
}

// ---

const ConditionsBlock: React.FC = () => {
  return (
    <div className="flex size-full border p-2 flex-col gap-2">
      <div>検索範囲</div>

      <InitialSeedBlock />

      <FrameInput />
      <IVsMethod />
    </div>
  )
}
const InitialSeedBlock: React.FC = () => {
  // 入力値の生のままの値
  // 不正値を弾いたり変換したりはここでは行わない
  type InitialSeedState = {
    fixed: string
    rtc: [number, number]
    painting: [number, number]
  }

  const [mode, setMode] = useState<'fixed' | 'rtc' | 'painting'>('fixed')
  const [state, setState] = useState<InitialSeedState>({
    fixed: '0',
    rtc: [0, 3],
    painting: [1200, 1500],
  })
  const handleChangeMode = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value
    if (v !== 'fixed' && v !== 'rtc' && v !== 'painting') return

    setMode(v)
  }

  return (
    <div>
      <select value={mode} onChange={handleChangeMode}>
        <option value="fixed">固定</option>
        <option value="rtc">電池あり</option>
        <option value="painting">絵画</option>
      </select>

      {mode === 'fixed' && (
        <div>
          <span className="mr-2">初期seed 0x</span>
          <input
            className="border w-24"
            value={state.fixed}
            onChange={(e) => {
              setState((prev) => ({ ...prev, fixed: e.target.value }))
            }}
          />
        </div>
      )}
      {mode === 'rtc' && (
        <div>
          電池待機
          <input
            type="number"
            className="border w-24"
            value={state.rtc[0]}
            onChange={(e) => {
              setState((prev) => ({ ...prev, rtc: [Number(e.target.value), prev.rtc[1]] }))
            }}
          />
          <span>分</span>
          <span>～</span>
          <input
            type="number"
            className="border w-24"
            value={state.rtc[1]}
            onChange={(e) => {
              setState((prev) => ({ ...prev, rtc: [prev.rtc[0], Number(e.target.value)] }))
            }}
          />
          <span>分</span>
        </div>
      )}
      {mode === 'painting' && (
        <div>
          絵画
          <input
            type="number"
            className="border w-24"
            value={state.painting[0]}
            onChange={(e) => {
              setState((prev) => ({ ...prev, painting: [Number(e.target.value), prev.painting[1]] }))
            }}
          />
          <span>F</span>
          <span>～</span>
          <input
            type="number"
            className="border w-24"
            value={state.painting[1]}
            onChange={(e) => {
              setState((prev) => ({ ...prev, painting: [prev.painting[0], Number(e.target.value)] }))
            }}
          />
          <span>F</span>
        </div>
      )}
    </div>
  )
}

const FrameInput: React.FC = () => {
  const [frameMin, setFrameMin] = useState(1949)
  const [frameMax, setFrameMax] = useState(2149)
  const [target, setTarget] = useState(2049)
  const [range, setRange] = useState(100)

  const handleSetFramesFromRange = () => {
    const min = Math.max(0, target - range)
    const max = target + range
    setFrameMin(min)
    setFrameMax(max)
  }

  return (
    <div>
      <div>
        <input
          type="number"
          className="border w-24"
          value={frameMin}
          onChange={(e) => {
            setFrameMin(Number(e.target.value))
          }}
        />
        <span>F</span>
        <span>～</span>
        <input
          type="number"
          className="border w-24"
          value={frameMax}
          onChange={(e) => {
            setFrameMax(Number(e.target.value))
          }}
        />
        <span>F</span>
      </div>

      <div>
        <span>目標フレーム</span>
        <input
          type="number"
          className="border w-24"
          value={target}
          onChange={(e) => {
            setTarget(Number(e.target.value))
          }}
        />
        <span>F</span>
        <span>±</span>
        <input
          type="number"
          className="border w-24"
          value={range}
          onChange={(e) => {
            setRange(Number(e.target.value))
          }}
        />
        <span>F</span>
        <button type="button" className="border px-2" onClick={handleSetFramesFromRange}>
          ↑
        </button>
      </div>
    </div>
  )
}

const IVsMethod: React.FC = () => {
  return (
    <div>
      <select defaultValue="method1">
        <option value="method1">Method1</option>
        <option value="method2">Method2</option>
        <option value="method4">Method4</option>
      </select>
    </div>
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

const ExecuteBlock: React.FC = () => {
  return (
    <div className="flex size-full border p-2">
      <div className="grid size-full">
        <VersionSelect />

        <button>検索</button>
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
