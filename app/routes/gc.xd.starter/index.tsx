import type { LoaderFunctionArgs, MetaFunction } from 'react-router'
import { useLoaderData } from 'react-router'

import { LCG } from '@/domain/gc/lcg'

import { PageActivated } from './PageActivated'
import { PageDefault } from './PageDefault'

export const meta: MetaFunction = () => {
  return [
    { title: 'Pokemon XD Starter RNG Tool' },
    { name: 'description', content: 'ポケモンXDのID・イーブイ乱数調整用のツールです。' },
  ]
}

export const clientLoader = ({ request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url)

  const target = searchParams.get('target')
  if (!target) return null

  return LCG.tryParse(target)
}

const Page: React.FC = () => {
  const targetSeed = useLoaderData<typeof clientLoader>()

  return targetSeed == null ? <PageDefault /> : <PageActivated targetSeed={targetSeed} />
}

export default Page
