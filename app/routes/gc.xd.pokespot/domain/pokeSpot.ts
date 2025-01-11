import { generateIVs, generatePID } from '@/domain/gc/generators'
import { generateAngle } from '@/domain/gc/generators/angle'
import type { Individual } from '@/domain/gc/generators/individual'
import { type LCG, getRand, next } from '@/domain/gc/lcg'
import { Ref } from '@/utilities/ref'

export type PokeSpotResult = Miss | Event | AppearingPokemon

type Miss = {
  kind: 'Miss'
}

type Event = {
  kind: 'Event'
  type: 'Munchlax' | 'Bonsly'
}

type AppearingPokemon = {
  kind: 'Appear'
  slot: Slot
  pid: number
}

type Slot = {
  species: string
  lv: [number, number]
}

export type PokeSpotKind = 'Rock' | 'Oasis' | 'Cave'
type PokeSpot<T extends PokeSpotKind> = {
  kind: T
  table: [Slot, Slot, Slot]
  navigationAdvance: {
    beforeUpgrade: [number, number]
    afterUpgrade: [number, number]
  }
}

export const pokeSpots = {
  Rock: {
    kind: 'Rock',
    table: [
      { species: 'サンド', lv: [10, 23] },
      { species: 'グライガー', lv: [10, 20] },
      { species: 'ナックラー', lv: [10, 20] },
    ],
    navigationAdvance: {
      beforeUpgrade: [5688, 5644],
      afterUpgrade: [7509, 7444],
    },
  },
  Cave: {
    kind: 'Cave',
    table: [
      { species: 'ズバット', lv: [10, 21] },
      { species: 'ココドラ', lv: [10, 21] },
      { species: 'ウパー', lv: [10, 21] },
    ],
    navigationAdvance: {
      beforeUpgrade: [5690, 5646],
      afterUpgrade: [7511, 7466],
    },
  },
  Oasis: {
    kind: 'Oasis',
    table: [
      { species: 'ハネッコ', lv: [10, 20] },
      { species: 'ゴマゾウ', lv: [10, 20] },
      { species: 'アメタマ', lv: [10, 20] },
    ],
    navigationAdvance: {
      beforeUpgrade: [5684, 5684],
      afterUpgrade: [7505, 7505],
    },
  },
} as const satisfies {
  [P in PokeSpotKind]: PokeSpot<P>
}

type Option = {
  bonsly?: boolean
}
export const generatePokeSpot =
  (table: [Slot, Slot, Slot], opt?: Option) =>
  (seed: LCG): [PokeSpotResult, LCG] => {
    const lcg = Ref.from(seed)

    if (lcg.apply(getRand, 3) !== 0) return [{ kind: 'Miss' }, lcg.unwrap()]
    if (opt?.bonsly) {
      lcg.update(next)

      const r = lcg.apply(getRand, 100)
      if (r < 30) return [{ kind: 'Event', type: 'Bonsly' }, lcg.unwrap()]
      if (r < 40) return [{ kind: 'Event', type: 'Munchlax' }, lcg.unwrap()]
    } else {
      if (lcg.apply(getRand, 100) < 10) return [{ kind: 'Event', type: 'Munchlax' }, lcg.unwrap()]
    }

    const r = lcg.apply(getRand, 100)
    const slot = r < 50 ? table[0] : r < 85 ? table[1] : table[2]
    const pid = lcg.apply(generatePID)

    return [{ kind: 'Appear', pid, slot }, lcg.unwrap()]
  }

export const generatePokemon =
  (slot: Slot & { pid: number }) =>
  (seed: LCG): [Individual & { lv: number }, LCG] => {
    const lcg = Ref.from(seed)
    lcg.update(next, 4) // 戦闘突入えふぇ区t
    lcg.update(generateAngle())
    lcg.update(next, 3) // ダミーTSV＋謎の1消費
    const range = slot.lv[1] - slot.lv[0] + 1
    const lv = slot.lv[0] + lcg.apply(getRand, range)
    lcg.update(next, 2) // ダミーPID
    const ivs = lcg.apply(generateIVs)
    const gcAbility = lcg.apply(getRand, 2)

    return [{ lv, pid: slot.pid, ivs, gcAbility }, lcg.unwrap()]
  }
