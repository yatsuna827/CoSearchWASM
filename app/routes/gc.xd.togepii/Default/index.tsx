import { useNavigate } from '@remix-run/react'

import { LabeledInput } from '@/components/LabeledInput'
import { useSeedInput } from '@/hooks/useSeedInput'

export const PageDefault: React.FC = () => {
  const [seed, controller] = useSeedInput('')
  const goto = useNavigate()

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
          {...controller}
        />

        <button
          type="submit"
          className="w-24 h-8 text-sm border font-semibold bg-white disabled:bg-gray-200 disabled:text-gray-400"
          disabled={seed == null}
        >
          OK
        </button>
      </form>
    </>
  )
}
