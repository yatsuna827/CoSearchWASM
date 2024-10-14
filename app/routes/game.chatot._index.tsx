import { LCG, lcg } from '@/domain/lcg'
import { useCallback, useRef, useState } from 'react'

const createOscilattorNode = (frequency: number) => {
  const ctx = new AudioContext()
  const node = new OscillatorNode(ctx, {
    frequency,
    type: 'square',
  })
  node.connect(ctx.destination)

  return node
}

const useLCG = () => {
  const [initialSeed] = useState(Math.floor(Math.random() * 0x100000000))
  const [seed, setSeed] = useState(initialSeed)
  const [rand, setRand] = useState<number | undefined>(undefined)
  const [history, setHistory] = useState<number[]>([])

  const getRand = useCallback(() => {
    const next = lcg(seed)
    const rand = next >>> 16
    setSeed(next)
    setRand(rand)
    setHistory((prev) => (prev.length < 4 ? [rand, ...prev] : [rand, ...prev.slice(0, 3)]))

    return rand
  }, [seed])

  return {
    seed,
    rand,
    initialSeed,
    history,
    getRand,
  }
}

const toFrequency = (r: number) => 880 * (1 + ((r % 8192) / 8192) * 0.25)

const Page: React.FC = () => {
  const { history, seed, getRand } = useLCG()
  const audioRef = useRef<OscillatorNode | null>(null)
  const handlePlay = () => {
    audioRef.current?.stop()

    const rand = getRand()
    audioRef.current = createOscilattorNode(toFrequency(rand))
    audioRef.current.start()
    audioRef.current.stop(0.75)
  }

  return (
    <main>
      <div className="flex flex-col justify-center items-center gap-4 w-full h-full">
        <div>
          seed:
          <span>0x{seed.toString(16).padStart(8, '0')}</span>
        </div>
        <button
          className="border border-black rounded px-4 py-1.5"
          type="button"
          onClick={handlePlay}
        >
          しばく
        </button>
        {history.map((rand, i) => {
          const cn = ['opacity-100 font-bold', 'opacity-40', 'opacity-30', 'opacity-20']
          return (
            <div className={cn[i]} key={`${i}__${rand}`}>
              {toFrequency(rand).toFixed(2)}Hz
            </div>
          )
        })}
      </div>
    </main>
  )
}

export default Page
