import { useNavigate } from '@remix-run/react'

import { LabeledInput } from '@/components/LabeledInput'
import { useSeedInput } from '@/hooks/useSeedInput'

import { Container } from './components'

export const PageDefault: React.FC = () => {
  const [seed, controller] = useSeedInput('')
  const goto = useNavigate()

  return (
    <Container>
      <div>
        <h1>目標seedを入力してください</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (seed == null) return

            goto({ pathname: '.', search: `?target=${seed.toString(16)}` })
          }}
        >
          <LabeledInput className="px-2" label="目標seed" placeholder="1234ABCD" {...controller} />
          <button type="submit" disabled={seed == null}>
            OK
          </button>
        </form>
      </div>
    </Container>
  )
}
