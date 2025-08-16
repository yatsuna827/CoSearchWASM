import { IVs } from '@/domain/gba/generators/ivs'
import { toHiddenPower } from '@/domain/hiddenPower'
import { Nature, natures, toJapanese } from '@/domain/nature'
import { POKE_TYPES, POKE_TYPE_JP, PokeType } from '@/domain/pokeType'
import { PrimitiveAtom, atom, useAtom } from 'jotai'
import z from 'zod'

export const FilterBlock: React.FC = () => {
  return (
    <div className="flex size-full border p-2 gap-4">
      <div className="grid gap-x-2 gap-y-1 grid-cols-[16px_64px_16px_64px] auto-rows-auto items-start">
        <SpeciesSelect />

        {Object.keys(ivsAtoms).map((key) => (
          <IVInput key={key} label={key.toUpperCase()} ivAtom={ivsAtoms[key as keyof typeof ivsAtoms]} />
        ))}
      </div>
      <div>
        <LevelInput />
        <NatureSelect />
        <AbilitySelect />
        <GenderSelect />
        <HiddenPowerInput />
        <ShinyInput />
      </div>
    </div>
  )
}
export const filterConditionAtom = atom((get) => {
  const ivsResult = ivsSchema.safeParse(
    Object.fromEntries(Object.entries(ivsAtoms).map(([key, atm]) => [key, get(atm)])),
  )
  if (!ivsResult.success) return null
  const hpMinResult = hiddenPowerPowerSchema.safeParse(get(hiddenPowerMinAtom))
  if (!hpMinResult.success) return null

  const hpMin = hpMinResult.data
  const hpType = get(selectedHiddenPowerTypeAtom)

  const nature = get(selectedNatureAtom)

  return {
    ivs: (ivs: IVs) => {
      const [type, power] = toHiddenPower(ivs)
      if (hpType != null && type !== hpType) return false
      if (power < hpMin) return false

      const { h, a, b, c, d, s } = ivsResult.data
      return (
        h[0] <= ivs[0] &&
        ivs[0] <= h[1] &&
        a[0] <= ivs[1] &&
        ivs[1] <= a[1] &&
        b[0] <= ivs[2] &&
        ivs[2] <= b[1] &&
        c[0] <= ivs[3] &&
        ivs[3] <= c[1] &&
        d[0] <= ivs[4] &&
        ivs[4] <= d[1] &&
        s[0] <= ivs[5] &&
        ivs[5] <= s[1]
      )
    },
    pid: (pid: number) => {
      if (nature != null && natures[(pid >>> 0) % 25] !== nature) return false

      return true
    },
  }
})

const SpeciesSelect: React.FC = () => {
  return <input className="col-span-full border" />
}
const LevelInput: React.FC = () => {
  return (
    <>
      <span>Lv.</span>
      <input type="number" className="border w-16 pl-1" defaultValue={50} />
      <div className="col-[3/5]" />
    </>
  )
}

const ivsAtoms = {
  h: atom<[string, string]>(['0', '31']),
  a: atom<[string, string]>(['0', '31']),
  b: atom<[string, string]>(['0', '31']),
  c: atom<[string, string]>(['0', '31']),
  d: atom<[string, string]>(['0', '31']),
  s: atom<[string, string]>(['0', '31']),
}
const ivSchema = z
  .tuple([
    z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(0).max(31).int()),
    z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(0).max(31).int()),
  ])
  .refine(([min, max]) => min <= max)
const ivsSchema = z.object({
  h: ivSchema,
  a: ivSchema,
  b: ivSchema,
  c: ivSchema,
  d: ivSchema,
  s: ivSchema,
})

const IVInput: React.FC<{ label: string; ivAtom: PrimitiveAtom<[string, string]> }> = ({ label, ivAtom }) => {
  const [[valMin, valMax], setValue] = useAtom(ivAtom)

  return (
    <>
      <span>{label}</span>
      <input
        type="number"
        className="border w-16 pl-1"
        min={0}
        max={31}
        value={valMin}
        onChange={(e) => setValue(([, max]) => [e.target.value, max])}
      />
      <span>～</span>
      <input
        type="number"
        className="border w-16 pl-1"
        min={0}
        max={31}
        value={valMax}
        onChange={(e) => setValue(([min]) => [min, e.target.value])}
      />
    </>
  )
}

const selectedNatureAtom = atom<Nature | null>(null)
const NatureSelect: React.FC = () => {
  const [value, setValue] = useAtom(selectedNatureAtom)

  return (
    <div className="flex gap-2">
      <span>性格</span>
      <select
        value={value ?? 'default'}
        onChange={(e) => {
          const value = e.target.value
          if (value === 'default') {
            setValue(null)
          } else {
            setValue(value as Nature)
          }
        }}
      >
        <option value="default">{'(指定なし)'}</option>
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
    <div className="flex gap-2">
      <span className="text-gray-300">特性</span>
      <select>
        <option>しめりけ</option>
        <option>ちょすい</option>
      </select>
    </div>
  )
}
const GenderSelect: React.FC = () => {
  return (
    <div className="flex gap-2">
      <span className="text-gray-300">性別</span>
      <select>
        <option>♂</option>
        <option>♀</option>
      </select>
    </div>
  )
}
const selectedHiddenPowerTypeAtom = atom<PokeType | null>(null)
const hiddenPowerMinAtom = atom('30')
const hiddenPowerPowerSchema = z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(30).max(70).int())
const HiddenPowerInput: React.FC = () => {
  const [value, setValue] = useAtom(selectedHiddenPowerTypeAtom)
  const [min, setMin] = useAtom(hiddenPowerMinAtom)

  return (
    <div className="flex gap-2">
      <span>めざパ</span>
      <select
        value={value ?? 'default'}
        onChange={(e) => {
          const value = e.target.value
          if (value === 'default') {
            setValue(null)
          } else {
            setValue(value as PokeType)
          }
        }}
      >
        <option value="default">{'(指定なし)'}</option>
        {POKE_TYPES.slice(1).map((t) => (
          <option key={t} value={t}>
            {POKE_TYPE_JP[t]}
          </option>
        ))}
      </select>
      <input
        type="number"
        value={min}
        min={30}
        max={70}
        className="border w-16 pl-1"
        onChange={(e) => setMin(e.target.value)}
      />
      <span>～</span>
    </div>
  )
}
const ShinyInput: React.FC = () => {
  return (
    <div className="flex gap-2">
      <span className="text-gray-300">色違いのみ</span>
      <input type="checkbox" />

      <span>表ID</span>
      <input className="border w-24 pl-1" />
      <span>裏ID</span>
      <input className="border w-24 pl-1" />
    </div>
  )
}
