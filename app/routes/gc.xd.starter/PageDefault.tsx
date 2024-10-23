import { useNavigate } from '@remix-run/react'

import { LabeledInput } from '@/components/LabeledInput'
import { useSeedInput } from '@/hooks/useSeedInput'

import type { LCG } from '@/domain/gc/lcg'
import { isValidSeed } from '@/domain/gc/starter/namingScreen'
import { generateStarter } from '@/domain/gc/starter/starterGenerator'
import { natures, toJapanese } from '@/domain/nature'
import { Container } from './components'

export const PageDefault: React.FC = () => {
  const [seed, controller] = useSeedInput('')
  const goto = useNavigate()

  return (
    <>
      <div className="relative flex items-center justify-center px-4 h-10 border-b">
        <h1 className="text-lg font-semibold">PokemonXD ID調整</h1>
      </div>
      <Container>
        <div className="px-4 py-2">
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
              {...controller}
            />
            {seed != null && <ResultBlock seed={seed} />}
            <button
              type="submit"
              className="w-24 h-8 text-sm border font-semibold bg-white disabled:bg-gray-200 disabled:text-gray-400"
              disabled={seed == null}
            >
              OK
            </button>
          </form>
        </div>
      </Container>
    </>
  )
}

type ResultBlockProps = {
  seed: LCG
}
const ResultBlock: React.FC<ResultBlockProps> = ({ seed }) => {
  const { tid, sid, eevee } = generateStarter(seed)
  const isValid = isValidSeed(seed)
  const isShiny = (tid ^ sid ^ (eevee.pid & 0xffff) ^ (eevee.pid >>> 16)) < 8

  return (
    <div className={isValid ? 'text-black' : 'text-gray-400'}>
      <div>目標seed: {seed.toString(16).toUpperCase().padStart(8, '0')}</div>
      <div>
        <span className="mr-4">TID: {tid.toString().padStart(5, '0')}</span>
        <span>SID: {sid.toString().padStart(5, '0')}</span>
      </div>
      <div>
        <span className="mr-2">{toJapanese(natures[eevee.pid % 25])}</span>
        <span className="mr-2">
          {eevee.ivs.map((_) => _.toString().padStart(2, '0')).join('-')}
        </span>
        <span>{isShiny && '☆'}</span>
      </div>
      {!isValid && <span className="text-red-600 font-semibold">到達不可能なseedです</span>}
    </div>
  )
}
