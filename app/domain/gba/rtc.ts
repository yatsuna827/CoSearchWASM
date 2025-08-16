import { LCG } from './lcg'

export const minutesToSeed = (m: number): LCG => {
  const day = Math.floor(m / 1440)
  m -= day * 1440

  const hour = Math.floor(m / 60)
  const minute = m - hour * 60

  const temp = 0x5a0 * (day + 1) + 0x3c * dec2bcd(hour) + dec2bcd(minute)
  return LCG.from((temp >>> 16) ^ (temp & 0xffff))
}

const dec2bcd = (dec: number): number => {
  return (Math.floor(dec / 10) << 4) + (dec % 10)
}
