import { useCallback, useRef, useState } from 'react'

import dataset_co from './address_co.json'
import dataset_xd from './address_xd.json'

type AddressData = {
  $: string
  use: string
  group?: string
}

const addressData = [...dataset_co, ...dataset_xd] satisfies AddressData[]
const addressMap = new Map(addressData.map(({ $, use, group }) => [$, { use, group }]))

type BreakLogRow = { address: string; registers: string[]; trigger: string }

const Index: React.FC = () => {
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const [result, setResult] = useState<'ERROR' | BreakLogRow[] | null>(null)

  const handleConvert = useCallback(() => {
    if (!inputRef.current) return

    const input = inputRef.current.value.trim().split('\n')

    const result = input.map(convert).filter(Boolean) as BreakLogRow[]

    setResult(result)
  }, [])

  const handleImport = useCallback(() => {
    if (!inputRef.current) return

    const input = inputRef.current.value.trim().split('\n')

    const result = input.map((line) => JSON.parse(line) as unknown).filter(isBreakLogRow)

    setResult(result)
  }, [])

  return (
    <div className="font-[system-ui,sans-serif] leading-8 h-full">
      <div className="max-w-[900px] h-full mx-auto px-1 py-2 bg-[#f9f9f9]">
        <textarea
          className="h-[100px] whitespace-pre bg-white w-full px-2 text-sm"
          ref={inputRef}
        />
        <button
          type="button"
          className="my-2 w-20 h-8 text-sm border font-semibold bg-white"
          onClick={handleConvert}
        >
          Convert
        </button>
        <button
          type="button"
          className="my-2 w-20 h-8 text-sm border font-semibold bg-white"
          onClick={handleImport}
        >
          Import
        </button>
        <div className="text-sm font-[Consolas] w-full h-[500px] overflow-scroll bg-white whitespace-pre">
          {result == null || result === 'ERROR'
            ? result
            : result
                .map((row) => addressMap.get(row.address) ?? row)
                .map((_) => JSON.stringify(_))
                .join('\n')}
        </div>
      </div>
    </div>
  )
}

const convert = (line: string): BreakLogRow | null => {
  try {
    let cells = line.split(' ')
    cells = cells.slice(4)
    const trigger = `$${cells.shift()}`
    cells = cells.slice(2)

    const registers = cells.slice(0, 10)
    if (!registers[0]) console.log(line)
    registers[0] = registers[0].substring(1)
    registers[9] = registers[9].substring(0, 8)

    cells = cells.slice(10)

    const address = (Number.parseInt(cells[0].substring(3), 16) - 4).toString(16)

    return { address, registers, trigger }
  } catch (e) {
    console.log(e)
    return null
  }
}

const isBreakLogRow = (line: unknown): line is BreakLogRow => {
  if (typeof line !== 'object' || !line) return false

  if (!('address' in line) || typeof line.address !== 'string') return false
  if (
    !('registers' in line) ||
    !Array.isArray(line.registers) ||
    line.registers.some((x) => typeof x !== 'string')
  )
    return false
  if (!('trigger' in line) || typeof line.trigger !== 'string') return false

  return true
}

export default Index
