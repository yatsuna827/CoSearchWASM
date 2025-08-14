import { SchemeName } from '@/domain/gba/generators/ivs'
import { LCG } from '@/domain/gba/lcg'
import { atom, useAtom } from 'jotai'
import { useRef } from 'react'

export const conditionStateAtom = atom((get) => {
  const initialSeed = get(initialSeedStateAtom)
  if (!initialSeed) return null

  const frame = get(frameStateAtom)
  if (!frame) return null

  const ivsScheme = get(ivsSchemeAtom)

  return {
    initialSeed,
    frame,
    ivsScheme,
  }
})
export const ConditionsBlock: React.FC = () => {
  return (
    <div className="flex size-full border p-2 flex-col gap-2">
      <div>検索範囲</div>

      <InitialSeedBlock />

      <FrameInput />
      <IVsMethod />
    </div>
  )
}

const initialSeedStateAtom = atom((get) => {
  const mode = get(initialSeedModeAtom)

  switch (mode) {
    case 'fixed': {
      const value = LCG.tryParse(get(fixedSeedAtom))

      return value != null ? { mode, value } : null
    }
    case 'rtc': {
      const raw = get(rtcMinuteRangeAtom)
      const [min, max] = [Number(raw[0] || undefined), Number(raw[1] || undefined)]
      if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) return null

      return { mode, value: [min, max] }
    }
    case 'painting': {
      const raw = get(paintingFrameRangeAtom)
      const [min, max] = [Number(raw[0] || undefined), Number(raw[1] || undefined)]
      if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) return null

      return { mode, value: [min, max] }
    }
    default:
      throw new Error(`unexpected mode: ${mode satisfies never}`)
  }
})

const fixedSeedAtom = atom('0')
const rtcMinuteRangeAtom = atom<[string, string]>(['0', '3'])
const paintingFrameRangeAtom = atom<[string, string]>(['1200', '1500'])
const initialSeedModeAtom = atom<'fixed' | 'rtc' | 'painting'>('fixed')

const InitialSeedBlock: React.FC = () => {
  const [mode, setMode] = useAtom(initialSeedModeAtom)
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

      {mode === 'fixed' && <InitialSeedFixed />}
      {mode === 'rtc' && <InitialSeedRTC />}
      {mode === 'painting' && <InitialSeedPainting />}
    </div>
  )
}
const InitialSeedFixed: React.FC = () => {
  const [value, setValue] = useAtom(fixedSeedAtom)

  return (
    <div>
      <span className="mr-2">初期seed 0x</span>
      <input
        className="border w-24"
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
        }}
      />
    </div>
  )
}
const InitialSeedRTC: React.FC = () => {
  const [value, setValue] = useAtom(rtcMinuteRangeAtom)

  return (
    <div>
      電池待機
      <input
        type="number"
        className="border w-24"
        value={value[0]}
        onChange={(e) => {
          setValue(([, max]) => [e.target.value, max])
        }}
      />
      <span>分</span>
      <span>～</span>
      <input
        type="number"
        className="border w-24"
        value={value[1]}
        onChange={(e) => {
          setValue(([min]) => [min, e.target.value])
        }}
      />
      <span>分</span>
    </div>
  )
}
const InitialSeedPainting: React.FC = () => {
  const [value, setValue] = useAtom(paintingFrameRangeAtom)

  return (
    <div>
      絵画
      <input
        type="number"
        className="border w-24"
        value={value[0]}
        onChange={(e) => {
          setValue(([, max]) => [e.target.value, max])
        }}
      />
      <span>F</span>
      <span>～</span>
      <input
        type="number"
        className="border w-24"
        value={value[1]}
        onChange={(e) => {
          setValue(([min]) => [min, e.target.value])
        }}
      />
      <span>F</span>
    </div>
  )
}

const frameStateAtom = atom((get) => {
  const [min, max] = [Number(get(frameMinRawAtom) || undefined), Number(get(frameMaxRawAtom) || undefined)]
  if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) return null

  const target = Number(get(targetFrameRawAtom) || undefined)
  if (!Number.isInteger(target)) return null

  return {
    range: [min, max] as const,
    target,
  }
})

const frameMinRawAtom = atom('1949')
const frameMaxRawAtom = atom('2149')
const targetFrameRawAtom = atom('2049')
const FrameInput: React.FC = () => {
  const [frameMin, setFrameMin] = useAtom(frameMinRawAtom)
  const [frameMax, setFrameMax] = useAtom(frameMaxRawAtom)
  const [target, setTarget] = useAtom(targetFrameRawAtom)
  const rangeInputRef = useRef<HTMLInputElement>(null)

  const handleSetFramesFromRange = () => {
    if (rangeInputRef.current == null) return

    const t = Number(target || undefined)
    if (!Number.isInteger(t)) return

    const range = Number(rangeInputRef.current.value || undefined)
    if (!Number.isInteger(range)) return

    const min = Math.max(0, t - range)
    const max = target + range
    setFrameMin(`${min}`)
    setFrameMax(`${max}`)
  }

  return (
    <div>
      <div>
        <input
          type="number"
          className="border w-24"
          value={frameMin}
          onChange={(e) => {
            setFrameMin(e.target.value)
          }}
        />
        <span>F</span>
        <span>～</span>
        <input
          type="number"
          className="border w-24"
          value={frameMax}
          onChange={(e) => {
            setFrameMax(e.target.value)
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
            setTarget(e.target.value)
          }}
        />
        <span>F</span>
        <span>±</span>
        <input ref={rangeInputRef} type="number" className="border w-24" />
        <span>F</span>
        <button type="button" className="border px-2" onClick={handleSetFramesFromRange}>
          ↑
        </button>
      </div>
    </div>
  )
}

const ivsSchemeAtom = atom<SchemeName>('standard')
const IVsMethod: React.FC = () => {
  const [ivsScheme, setIVsScheme] = useAtom(ivsSchemeAtom)

  return (
    <div>
      <select value={ivsScheme} onChange={(e) => setIVsScheme(e.target.value as SchemeName)}>
        <option value={'standard' satisfies SchemeName}>Method1</option>
        <option value={'interruptedMiddle' satisfies SchemeName}>Method4</option>
        <option value={'interruptedPrior' satisfies SchemeName}>Method2</option>
      </select>
    </div>
  )
}
