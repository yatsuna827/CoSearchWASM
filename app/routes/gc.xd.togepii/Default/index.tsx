import { type SubmitHandler, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { LabeledInput } from '@/components/LabeledInput'
import { useSeedInput } from '@/hooks/useSeedInput'

import { LCG } from '@/domain/gc/lcg'
import { toJapanese } from '@/domain/nature'
import { useCallback, useRef, useState } from 'react'
import { IndividualPreview } from '../components/IndividualPreview'
import { generateTogepii } from '../domain/generateTogepii'
import { findSeed } from '@/lib/wasmApi'

type Input = {
  hMin: number
  hMax: number
  aMin: number
  aMax: number
  bMin: number
  bMax: number
  cMin: number
  cMax: number
  dMin: number
  dMax: number
  sMin: number
  sMax: number
}

export const PageDefault: React.FC = () => {
  const [seed, controller] = useSeedInput('')
  const individual = seed != null ? generateTogepii(seed) : null
  const goto = useNavigate()

  const { register, handleSubmit } = useForm<Input>()

  const [result, setResult] = useState<
    { seed: LCG; individual: ReturnType<typeof generateTogepii> }[]
  >([])
  const handleSearch: SubmitHandler<Input> = useCallback(
    async (data) => {
      const ivsMin = [data.hMin, data.aMin, data.bMin, data.cMin, data.dMin, data.sMin]
      const ivsMax = [data.hMax, data.aMax, data.bMax, data.cMax, data.dMax, data.sMax]

      const res: LCG[] = []

      for (let h = ivsMin[0]; h <= ivsMax[0]; h++) {
        for (let a = ivsMin[1]; a <= ivsMax[1]; a++) {
          for (let b = ivsMin[2]; b <= ivsMax[2]; b++) {
            for (let c = ivsMin[3]; c <= ivsMax[3]; c++) {
              for (let d = ivsMin[4]; d <= ivsMax[4]; d++) {
                for (let s = ivsMin[5]; s <= ivsMax[5]; s++) {
                  const seeds = await findSeed(h, a, b, c, d, s)
                  res.push(...seeds.map(item => item.seed))
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
    },
    [],
  )

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
      <form onSubmit={handleSubmit(handleSearch)}>
        <button
          type="button"
          className="w-24 h-8 text-sm border font-semibold text-[#333] bg-white disabled:bg-gray-200 disabled:text-gray-400"
        >
          けんさく
        </button>
        <div className="flex [&_input]:w-16 [&_input]:pl-2 gap-4 items-end">
          <span>H</span>
          <input
            defaultValue={31}
            type="number"
            min={0}
            max={31}
            {...register('hMin', { min: 0, max: 31 })}
          />
          <span>～</span>
          <input
            defaultValue={31}
            type="number"
            min={0}
            max={31}
            {...register('hMax', { min: 0, max: 31 })}
          />
        </div>
        <div className="flex [&_input]:w-16 [&_input]:pl-2 gap-4 items-end">
          <span>A</span>
          <input
            defaultValue={31}
            type="number"
            min={0}
            max={31}
            {...register('aMin', { min: 0, max: 31 })}
          />
          <span>～</span>
          <input
            defaultValue={31}
            type="number"
            min={0}
            max={31}
            {...register('aMax', { min: 0, max: 31 })}
          />
        </div>
        <div className="flex [&_input]:w-16 [&_input]:pl-2 gap-4 items-end">
          <span>B</span>
          <input
            defaultValue={31}
            type="number"
            min={0}
            max={31}
            {...register('bMin', { min: 0, max: 31 })}
          />
          <span>～</span>
          <input
            defaultValue={31}
            type="number"
            min={0}
            max={31}
            {...register('bMax', { min: 0, max: 31 })}
          />
        </div>
        <div className="flex [&_input]:w-16 [&_input]:pl-2 gap-4 items-end">
          <span>C</span>
          <input
            defaultValue={31}
            type="number"
            min={0}
            max={31}
            {...register('cMin', { min: 0, max: 31 })}
          />
          <span>～</span>
          <input
            defaultValue={31}
            type="number"
            min={0}
            max={31}
            {...register('cMax', { min: 0, max: 31 })}
          />
        </div>
        <div className="flex [&_input]:w-16 [&_input]:pl-2 gap-4 items-end">
          <span>D</span>
          <input
            defaultValue={31}
            type="number"
            min={0}
            max={31}
            {...register('dMin', { min: 0, max: 31 })}
          />
          <span>～</span>
          <input
            defaultValue={31}
            type="number"
            min={0}
            max={31}
            {...register('dMax', { min: 0, max: 31 })}
          />
        </div>
        <div className="flex [&_input]:w-16 [&_input]:pl-2 gap-4 items-end">
          <span>S</span>
          <input
            defaultValue={31}
            type="number"
            min={0}
            max={31}
            {...register('sMin', { min: 0, max: 31 })}
          />
          <span>～</span>
          <input
            defaultValue={31}
            type="number"
            min={0}
            max={31}
            {...register('sMax', { min: 0, max: 31 })}
          />
        </div>
      </form>

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
