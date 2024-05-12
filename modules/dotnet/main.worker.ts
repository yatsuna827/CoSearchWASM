import { expose } from 'comlink'

type AssemblyExports = {
  MyClass: {
    SearchNearBy(
      seedHex: string,
      max: number,
      name: string,
      ivsMin: [number, number, number, number, number, number],
      ivsMax: [number, number, number, number, number, number],
      nature: number,
    ): string

    BlinkTimeLine(seedHex: string, maxFrames: number): string

    SearchCurrentSeedByBlink(
      seedHex: string,
      min: number,
      max: number,
      input: number[],
      cooltTime: number,
      error: number,
    ): string[]
  }
}

let _promise: Promise<AssemblyExports | null> | null = null
const getAssmblyExports = async () => {
  if (_promise !== null) return _promise

  _promise = (async () => {
    try {
      const { dotnet } = await import(/* @vite-ignore */ './framework/dotnet.js')

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const { getAssemblyExports, getConfig } = (await dotnet.create()) as any

      const config = getConfig()
      return (await getAssemblyExports(config.mainAssemblyName)) as AssemblyExports
    } catch (err) {
      return null
    }
  })()

  const result = await _promise
  if (result == null) _promise = null

  return result
}

type SearchNearbyParams = {
  name: string
  seedHex: string
  max: number
  ivsMin?: [number, number, number, number, number, number]
  ivsMax?: [number, number, number, number, number, number]
  nature: number
}
export type SearchNearbyResult = {
  index: number
  seed: string
  ivs: [number, number, number, number, number, number]
  pid: string
  nature: string
  ability: string
  gcAbility: string
}
const searchNearby = async ({
  name,
  seedHex,
  max = 1000,
  ivsMin = [31, 31, 31, 31, 31, 31],
  ivsMax = [31, 31, 31, 31, 31, 31],
  nature = 0,
}: SearchNearbyParams) => {
  const assmblyExports = await getAssmblyExports()
  if (!assmblyExports) return null

  const rawData = assmblyExports.MyClass.SearchNearBy(seedHex, max, name, ivsMin, ivsMax, nature)
  return JSON.parse(rawData) as SearchNearbyResult[]
}

type BlinkTimeLineParams = {
  seedHex: string
  maxFrames: number
}
export type BlinkTimelineResult = {
  seed: string
  frame: number
  interval: number
}
const blinkTimeLine = async ({ seedHex, maxFrames }: BlinkTimeLineParams) => {
  const assmblyExports = await getAssmblyExports()
  if (!assmblyExports) return null

  const rawData = assmblyExports.MyClass.BlinkTimeLine(seedHex, maxFrames)
  return JSON.parse(rawData) as BlinkTimelineResult[]
}

// string[] SearchCurrentSeedByBlink(string seedHex, int min, int max, int[] input, int coolTime, int error)

export type SearchCurrentSeedByBlinkParams = {
  seedHex: string
  min: number
  max: number
  input: number[]
}
const searchCurrentSeedByBlink = async ({
  seedHex,
  min,
  max,
  input,
}: SearchCurrentSeedByBlinkParams) => {
  const assmblyExports = await getAssmblyExports()
  if (!assmblyExports) return null

  return assmblyExports.MyClass.SearchCurrentSeedByBlink(seedHex, min, max, input, 4, 10)
}

const load = async () => {
  const assmblyExports = await getAssmblyExports()
  return assmblyExports != null
}

const api = {
  searchNearby,
  blinkTimeLine,
  searchCurrentSeedByBlink,
  load,
}

export type WorkerAPI = typeof api

expose(api)
