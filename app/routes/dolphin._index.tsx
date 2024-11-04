import { useCallback, useRef, useState } from 'react'

const Index: React.FC = () => {
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const [result, setResult] = useState('')

  const handleConvert = useCallback(() => {
    if (!inputRef.current) return

    const input = inputRef.current.value.trim().split('\n')

    console.log(input)

    const result = convert(input)

    setResult(result?.join('\n') ?? 'ERROR')
  }, [])

  return (
    <div className="font-[system-ui,sans-serif] leading-8 h-full">
      <div className="max-w-[900px] h-full mx-auto overflow-x-hidden overflow-y-scroll px-1 py-2 bg-[#f9f9f9]">
        <div>raw</div>
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
        <div className="text-sm select-all font-[Consolas] w-full h-[500px] overflow-scroll bg-white whitespace-pre">
          {result}
        </div>
      </div>
    </div>
  )
}

const convert = (input: string[]) => {
  try {
    return input.map((line) => {
      console.log(line)
      let cells = line.split(' ')
      cells = cells.slice(4)
      const trigger = `$${cells.shift()}`
      cells = cells.slice(2)

      const registers = cells.slice(0, 10)
      registers[0] = registers[0].substring(1)
      registers[9] = registers[9].substring(0, 8)

      cells = cells.slice(10)

      const address = (Number.parseInt(cells[0].substring(3), 16) - 4).toString(16)

      return JSON.stringify({ address, registers, trigger })
    })
  } catch (e) {
    console.log(e)
    return null
  }
}

export default Index
