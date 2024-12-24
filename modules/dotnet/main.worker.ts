import { expose } from 'comlink'

const load = async () => {
  // const assmblyExports = await getAssmblyExports()
  // return assmblyExports != null
  return true
}

const api = {
  load,
}

export type WorkerAPI = typeof api

expose(api)
