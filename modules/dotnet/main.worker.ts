import { expose } from 'comlink'

import { dotnet, exit } from './framework/dotnet.js'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
let _assemblyExports: any = null
let _isLoading = false

const setupDotnet = async () => {
  if (_assemblyExports || _isLoading) return

  _isLoading = true

  try {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const { getAssemblyExports, getConfig } = (await dotnet.create()) as any

    const config = getConfig()
    _assemblyExports = await getAssemblyExports(config.mainAssemblyName)
  } catch (err) {
    exit(2, err)
  } finally {
    _isLoading = false
  }
}

type SearchNearbyParams = {
  name: string
  seedHex: string
  max: number
  ivsMin?: [number, number, number, number, number, number]
  ivsMax?: [number, number, number, number, number, number]
  nature: number
}

const searchNearby = ({
  name,
  seedHex,
  max = 1000,
  ivsMin = [31, 31, 31, 31, 31, 31],
  ivsMax = [31, 31, 31, 31, 31, 31],
  nature = 0,
}: SearchNearbyParams) => {
  const rawData = _assemblyExports.MyClass.SearchNearBy(seedHex, max, name, ivsMin, ivsMax, nature)
  return JSON.parse(rawData)
}

const api = {
  setupDotnet,
  searchNearby,
}

export type WorkerAPI = typeof api

expose(api)
