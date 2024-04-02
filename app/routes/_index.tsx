import type { SearchNearbyResult } from '@dotnet/main.worker'
import type { MetaFunction } from '@remix-run/node'
import { type ComponentProps, forwardRef, useId, useMemo, useRef, useState } from 'react'
import { type NatureJp, natureToInt, natures, toJapanese } from '~/domain/nature'

import { useSearchWorker } from '~/hooks/useSearchWorker'

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix SPA' },
    { name: 'description', content: 'Welcome to Remix (SPA Mode)!' },
  ]
}

// #3498db
// #e67e22
// #f2f2f2
// #c0392b

type LabeledInputProps = ComponentProps<'input'> & { label: string }
const LabeledInput = forwardRef<HTMLInputElement, LabeledInputProps>(({ label, ...props }, ref) => {
  const id = useId()

  return (
    <div>
      <label htmlFor={id} className="block">
        {label}
      </label>
      <input {...props} ref={ref} id={id} />
    </div>
  )
})

type IVsInputProps = Omit<LabeledInputProps, 'type' | 'min' | 'max'>
const IVsInput = forwardRef<HTMLInputElement, IVsInputProps>((props, ref) => {
  const id = useId()

  return (
    <LabeledInput defaultValue={0} {...props} ref={ref} type="number" min={0} max={31} id={id} />
  )
})

type SearchButtonProps = ComponentProps<'button'> & {
  searching: boolean
}
const SearchButton: React.FC<SearchButtonProps> = ({ searching, children, ...props }) => {
  return (
    // hover:bg-blue-300
    <button
      {...props}
      type="button"
      disabled={searching}
      className="flex justify-center items-center rounded bg-blue-400 w-32 h-10 text-white"
    >
      {searching ? (
        <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent" />
      ) : (
        <span className="font-medium">{children}</span>
      )}
    </button>
  )
}

export default function Index() {
  const naturesJp = useMemo(() => natures.map(toJapanese).toSorted(), [])

  const [results, setResults] = useState<SearchNearbyResult[]>([])
  const seedInputRef = useRef<HTMLInputElement>(null)
  const maxFramesInputRef = useRef<HTMLInputElement>(null)

  const [selectedNature, setNature] = useState<NatureJp | '---'>('---')

  const hMinInputRef = useRef<HTMLInputElement>(null)
  const hMaxInputRef = useRef<HTMLInputElement>(null)
  const aMaxInputRef = useRef<HTMLInputElement>(null)
  const aMinInputRef = useRef<HTMLInputElement>(null)
  const bMinInputRef = useRef<HTMLInputElement>(null)
  const bMaxInputRef = useRef<HTMLInputElement>(null)
  const cMinInputRef = useRef<HTMLInputElement>(null)
  const cMaxInputRef = useRef<HTMLInputElement>(null)
  const dMinInputRef = useRef<HTMLInputElement>(null)
  const dMaxInputRef = useRef<HTMLInputElement>(null)
  const sMinInputRef = useRef<HTMLInputElement>(null)
  const sMaxInputRef = useRef<HTMLInputElement>(null)

  const worker = useSearchWorker()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!seedInputRef.current) return
    if (!maxFramesInputRef.current) return

    const seedHex = seedInputRef.current.value
    const max = Number(maxFramesInputRef.current.value)
    const ivsMin = [
      hMinInputRef.current?.value,
      aMinInputRef.current?.value,
      bMinInputRef.current?.value,
      cMinInputRef.current?.value,
      dMinInputRef.current?.value,
      sMinInputRef.current?.value,
    ].map(Number) as [number, number, number, number, number, number]
    const ivsMax = [
      hMaxInputRef.current?.value,
      aMaxInputRef.current?.value,
      bMaxInputRef.current?.value,
      cMaxInputRef.current?.value,
      dMaxInputRef.current?.value,
      sMaxInputRef.current?.value,
    ].map(Number) as [number, number, number, number, number, number]

    if (!/^[0-9a-fA-F]{1,8}$/.test(seedHex)) return alert('Seedの入力が不正です')
    if (!Number.isInteger(max) || max < 0) return alert('検索範囲の入力が不正です')

    setLoading(true)
    const result = await worker.searchNearby({
      name: 'ヌオー',
      nature: selectedNature === '---' ? 25 : natureToInt(selectedNature),
      max,
      ivsMin,
      ivsMax,
      seedHex,
    })
    if (result) setResults(result)
    else alert('計算中にエラーが発生しました;;')
    setLoading(false)
  }

  return (
    <div className="font-[system-ui,sans-serif] leading-8 flex h-full">
      <div className="bg-stone-200 p-5 w-[300px] h-full min-h-[600px] space-y-4 overflow-y-scroll">
        <SearchButton onClick={handleClick} searching={loading}>
          Search
        </SearchButton>
        <LabeledInput ref={seedInputRef} label="seed" placeholder="1234ABCD" />
        <LabeledInput
          ref={maxFramesInputRef}
          label="max"
          type="number"
          defaultValue={10000}
          placeholder="1234ABCD"
        />
        <select
          id="countries"
          value={selectedNature}
          onChange={(e) => setNature(e.target.value as NatureJp | '---')}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option value="---">---</option>
          {naturesJp.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <div className="flex [&_input]:w-16 [&_input]:pl-2 gap-4 items-end">
          <span>H</span>
          <IVsInput ref={hMinInputRef} label="min" />
          <IVsInput ref={hMaxInputRef} label="max" defaultValue={31} />
        </div>
        <div className="flex [&_input]:w-16 [&_input]:pl-2 gap-4 items-end">
          <span>A</span>
          <IVsInput ref={aMinInputRef} label="min" />
          <IVsInput ref={aMaxInputRef} label="max" defaultValue={31} />
        </div>
        <div className="flex [&_input]:w-16 [&_input]:pl-2 gap-4 items-end">
          <span>B</span>
          <IVsInput ref={bMinInputRef} label="min" />
          <IVsInput ref={bMaxInputRef} label="max" defaultValue={31} />
        </div>
        <div className="flex [&_input]:w-16 [&_input]:pl-2 gap-4 items-end">
          <span>C</span>
          <IVsInput ref={cMinInputRef} label="min" />
          <IVsInput ref={cMaxInputRef} label="max" defaultValue={31} />
        </div>
        <div className="flex [&_input]:w-16 [&_input]:pl-2 gap-4 items-end">
          <span>D</span>
          <IVsInput ref={dMinInputRef} label="min" />
          <IVsInput ref={dMaxInputRef} label="max" defaultValue={31} />
        </div>
        <div className="flex [&_input]:w-16 [&_input]:pl-2 gap-4 items-end">
          <span>S</span>
          <IVsInput ref={sMinInputRef} label="min" />
          <IVsInput ref={sMaxInputRef} label="max" defaultValue={31} />
        </div>
      </div>

      <div className="flex-auto overflow-x-hidden overflow-y-scroll px-1 bg-[#f9f9f9]">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse border-spacing-0 bg-stone-200">
            <thead className="bg-stone-200">
              <tr>
                <th scope="col" />
                <th scope="col" />
                <th scope="col" />
                <th scope="col" colSpan={6}>
                  IVs
                </th>
              </tr>
              <tr>
                <th scope="col">Index</th>
                <th scope="col">Seed</th>
                <th scope="col">Nature</th>
                <th scope="col">H</th>
                <th scope="col">A</th>
                <th scope="col">B</th>
                <th scope="col">C</th>
                <th scope="col">D</th>
                <th scope="col">S</th>
              </tr>
            </thead>
            <tbody>
              {results.map(({ index, seed, nature, ivs }) => (
                <tr key={index} className="odd:bg-[#f9f9f9]">
                  <td>{index}</td>
                  <td>{seed}</td>
                  <td>{nature}</td>
                  <td>{ivs[0]}</td>
                  <td>{ivs[1]}</td>
                  <td>{ivs[2]}</td>
                  <td>{ivs[3]}</td>
                  <td>{ivs[4]}</td>
                  <td>{ivs[5]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
