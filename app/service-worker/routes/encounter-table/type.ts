export type Slot = [string, number, number]

export type GrassMap = {
  name: string
  val: number
  table: [Slot, Slot, Slot, Slot, Slot, Slot, Slot, Slot, Slot, Slot, Slot, Slot]
}
export type SurfMap = { name: string; val: number; table: [Slot, Slot, Slot, Slot, Slot] }
export type OldRodMap = { name: string; val: number; table: [Slot, Slot] }
export type GoodRodMap = { name: string; val: number; table: [Slot, Slot, Slot] }
export type SuperRodMap = { name: string; val: number; table: [Slot, Slot, Slot, Slot, Slot] }
export type RockSmashMap = { name: string; val: number; table: [Slot, Slot, Slot, Slot, Slot] }
