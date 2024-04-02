import type { BlinkTimelineResult } from '@dotnet/main.worker'
import type { MetaFunction } from '@remix-run/node'
import { type ComponentProps, forwardRef, useId, useMemo, useRef, useState } from 'react'

import { useSearchWorker } from '~/hooks/useSearchWorker'

export const meta: MetaFunction = () => {
  return [{ title: 'Co Blink Timeline' }, { name: 'description', content: '・。・v' }]
}

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
  const [results, setResults] = useState<BlinkTimelineResult[]>([])
  const seedInputRef = useRef<HTMLInputElement>(null)
  const maxFramesInputRef = useRef<HTMLInputElement>(null)

  const worker = useSearchWorker()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!seedInputRef.current) return
    if (!maxFramesInputRef.current) return

    const seedHex = seedInputRef.current.value
    const max = Number(maxFramesInputRef.current.value)

    if (!/^[0-9a-fA-F]{1,8}$/.test(seedHex)) return alert('Seedの入力が不正です')
    if (!Number.isInteger(max) || max < 0) return alert('検索範囲の入力が不正です')

    setLoading(true)
    const result = await worker.blinkTimeLine({
      seedHex,
      maxFrames: max,
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
      </div>

      <div className="flex-auto overflow-x-hidden overflow-y-scroll px-1 bg-[#f9f9f9]">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse border-spacing-0 bg-stone-200">
            <thead className="bg-stone-200">
              <tr>
                <th scope="col">Frames</th>
                <th scope="col">Seed</th>
                <th scope="col">Interval</th>
              </tr>
            </thead>
            <tbody>
              {results.map(({ seed, frame, interval }) => (
                <tr key={seed} className="odd:bg-[#f9f9f9]">
                  <td>{frame}</td>
                  <td>{seed}</td>
                  <td>{interval}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
