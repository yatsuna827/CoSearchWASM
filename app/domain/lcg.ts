export class LCG {
  constructor(seed = 0) {
    this.#seed = seed >>> 0
  }
  #seed: number

  getSeed() {
    return this.#seed >>> 0
  }
  advance() {
    this.#seed = mult32(this.#seed, 0x41c64e6d) + 0x6073
    return this.#seed
  }
  getRand(m?: number) {
    const r = this.advance() >>> 16

    return m ? r % m : r
  }
}

export const lcg = (seed: number) => (mult32(seed, 0x41c64e6d) + 0x6073) >>> 0

const mult32 = (a: number, b: number): number => {
  const a_h = a >>> 16
  const a_l = a & 0xffff

  const b_h = b >>> 16
  const b_l = b & 0xffff

  // 最後の>>>0がないと符号あり整数になる
  return (((a_h * b_l + a_l * b_h) << 16) + a_l * b_l) >>> 0
}
