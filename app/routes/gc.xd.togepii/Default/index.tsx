import { useNavigate } from 'react-router'

import { LabeledInput } from '@/components/LabeledInput'
import { useSeedInput } from '@/hooks/useSeedInput'

import { LCG } from '@/domain/gc/lcg'
import { toJapanese } from '@/domain/nature'
import { useCallback, useRef, useState } from 'react'
import { IndividualPreview } from '../components/IndividualPreview'
import { generateTogepii } from '../domain/generateTogepii'
import { useWASM } from '../wasm/Context'

export const PageDefault: React.FC = () => {
  const [seed, controller] = useSeedInput('')
  const individual = seed != null ? generateTogepii(seed) : null
  const goto = useNavigate()

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

  const wasmReturn = useWASM()
  const [result, setResult] = useState<
    { seed: LCG; individual: ReturnType<typeof generateTogepii> }[]
  >([])
  const handleSearch = useCallback(async () => {
    const { findSeed } = await wasmReturn

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

    const res: LCG[] = []

    for (let h = ivsMin[0]; h <= ivsMax[0]; h++) {
      for (let a = ivsMin[1]; a <= ivsMax[1]; a++) {
        for (let b = ivsMin[2]; b <= ivsMax[2]; b++) {
          for (let c = ivsMin[3]; c <= ivsMax[3]; c++) {
            for (let d = ivsMin[4]; d <= ivsMax[4]; d++) {
              for (let s = ivsMin[5]; s <= ivsMax[5]; s++) {
                res.push(...findSeed([h, a, b, c, d, s]))
              }
            }
          }
        }
      }
    }

    setResult(
      res.map((seed) => ({
        seed,
        individual: generateTogepii(seed),
      })),
    )
  }, [wasmReturn])

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (seed == null) return

          goto({ pathname: '.', search: `?target=${seed.toString(16)}` })
        }}
      >
        <LabeledInput
          className="px-2 mb-4"
          label="目標seed"
          placeholder="1234ABCD"
          autoComplete="off"
          {...controller}
        />
        {individual && (
          <div className="mb-4">
            <IndividualPreview individual={individual} />
          </div>
        )}

        <button
          type="submit"
          className="w-24 h-8 text-sm border font-semibold bg-white disabled:bg-gray-200 disabled:text-gray-400"
          disabled={seed == null}
        >
          OK
        </button>
      </form>

      <div className="mt-6 border-t">こたいちからけんさく</div>
      <button
        type="button"
        className="w-24 h-8 text-sm border font-semibold text-[#333] bg-white disabled:bg-gray-200 disabled:text-gray-400"
        onClick={handleSearch}
      >
        けんさく
      </button>
      <>
        <div className="flex [&_input]:w-16 [&_input]:pl-2 gap-4 items-end">
          <span>H</span>
          <input ref={hMinInputRef} defaultValue={31} type="number" min={0} max={31} />
          <span>～</span>
          <input ref={hMaxInputRef} defaultValue={31} type="number" min={0} max={31} />
        </div>
        <div className="flex [&_input]:w-16 [&_input]:pl-2 gap-4 items-end">
          <span>A</span>
          <input ref={aMinInputRef} defaultValue={31} type="number" min={0} max={31} />
          <span>～</span>
          <input ref={aMaxInputRef} defaultValue={31} type="number" min={0} max={31} />
        </div>
        <div className="flex [&_input]:w-16 [&_input]:pl-2 gap-4 items-end">
          <span>B</span>
          <input ref={bMinInputRef} defaultValue={31} type="number" min={0} max={31} />
          <span>～</span>
          <input ref={bMaxInputRef} defaultValue={31} type="number" min={0} max={31} />
        </div>
        <div className="flex [&_input]:w-16 [&_input]:pl-2 gap-4 items-end">
          <span>C</span>
          <input ref={cMinInputRef} defaultValue={31} type="number" min={0} max={31} />
          <span>～</span>
          <input ref={cMaxInputRef} defaultValue={31} type="number" min={0} max={31} />
        </div>
        <div className="flex [&_input]:w-16 [&_input]:pl-2 gap-4 items-end">
          <span>D</span>
          <input ref={dMinInputRef} defaultValue={31} type="number" min={0} max={31} />
          <span>～</span>
          <input ref={dMaxInputRef} defaultValue={31} type="number" min={0} max={31} />
        </div>
        <div className="flex [&_input]:w-16 [&_input]:pl-2 gap-4 items-end">
          <span>S</span>
          <input ref={sMinInputRef} defaultValue={31} type="number" min={0} max={31} />
          <span>～</span>
          <input ref={sMaxInputRef} defaultValue={31} type="number" min={0} max={31} />
        </div>
      </>

      <div className="max-h-[300px] border overflow-y-scroll px-2">
        <div>
          {result.map(({ seed, individual }) => (
            <div key={seed} className="flex gap-2">
              <div>{LCG.stringify(seed)}</div>
              <div>{individual.ivs.join('-')}</div>
              <div>{toJapanese(individual.nature)}</div>
              <div>{['はりきり', 'てんのめぐみ'][individual.pid % 2]}</div>
              <div>{['はりきり', 'てんのめぐみ'][individual.gcAbility]}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
