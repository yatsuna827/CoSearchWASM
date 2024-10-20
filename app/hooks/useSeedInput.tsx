import { LCG } from '@/domain/gc/lcg'
import { type ComponentProps, useCallback, useMemo, useState } from 'react'

export type SeedInputController = Pick<ComponentProps<'input'>, 'value' | 'onChange'>
export const useSeedInput = (defaultValue = '0'): [LCG | null, SeedInputController] => {
  const [seedRaw, setSeedRaw] = useState<string>(defaultValue)
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSeedRaw(e.target.value)
  }, [])

  const seed = useMemo(() => {
    return seedRaw != null ? LCG.tryParse(seedRaw) : null
  }, [seedRaw])

  return [seed, { value: seedRaw, onChange }]
}
