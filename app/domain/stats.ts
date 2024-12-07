import type { IVs } from './gc/generators'
import { type Nature, statFactors } from './nature'

export const toStats = (
  bs: [number, number, number, number, number, number],
  ivs: IVs,
  lv: number,
  nature: Nature,
) => {
  const [h_bs, ...rest_bs] = bs
  const [h_iv, ...rest_iv] = ivs
  const [_, ...fac] = statFactors[nature]

  return [
    Math.floor(((h_bs * 2 + h_iv) * lv) / 100) + 10 + lv,
    ...Array.from({ length: 5 }, (_, i) =>
      Math.floor((Math.floor(((rest_bs[i] * 2 + rest_iv[i]) * lv) / 100) + 5) * fac[i]),
    ),
  ] as [number, number, number, number, number, number]
}
