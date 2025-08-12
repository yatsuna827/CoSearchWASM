import type { LoaderFunctionArgs, MetaFunction } from 'react-router'
import { useLoaderData } from 'react-router'

import { Container } from '@/components/Container'
import { LCG } from '@/domain/gc/lcg'

import { PageActivated } from './Activated'
import { PageDefault } from './Default'

export const meta: MetaFunction = () => {
  return [
    { title: 'Pokemon XD Togepii RNG Tool' },
    { name: 'description', content: 'ポケモンXDのトゲピー乱数調整用のツールです。' },
  ]
}

// 19F0033A / 5E967EC0
// 6D3167B2

export const clientLoader = ({ request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url)

  const target = searchParams.get('target')
  if (!target) return null

  return LCG.tryParse(target)
}

const Page: React.FC = () => {
  const targetSeed = useLoaderData<typeof clientLoader>()

  return (
    <>
      <div className="sticky top-0 flex items-center justify-center px-4 h-14 border-b bg-white">
        <h1 className="text-lg font-semibold">PokemonXD トゲピー</h1>
      </div>

      <Container>{targetSeed == null ? <PageDefault /> : <PageActivated targetSeed={targetSeed} />}</Container>
    </>
  )
}

export default Page
