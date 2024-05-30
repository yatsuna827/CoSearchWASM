import { useCallback, useEffect, useRef, useState } from 'react'
import { PokeBall } from '~/components/PokeBall'

const to30fps = (ms: number) => Math.floor((ms / 1000) * 30)

const theoreticalBlanks = [22, 94, 65, 52, 22, 25, 18, 20, 77, 94, 94, 94, 43, 87]

const Page: React.FC = () => {
  const [isFull, setIsFull] = useState(false)

  const [prevBlinked, setPrevBlinked] = useState<number | undefined>(undefined)
  const [blinkHistory, setBlinkHistory] = useState<number[]>([])

  const progress = blinkHistory.length < 1 ? 0 : (blinkHistory.length / 14) * 100

  const handleRecordBlink = useCallback(() => {
    if (blinkHistory.length >= 14) return

    const current = Date.now()
    if (prevBlinked) {
      const next = [...blinkHistory, to30fps(current - prevBlinked)]
      setBlinkHistory(next)
    }

    setPrevBlinked(current)
  }, [blinkHistory, prevBlinked])
  const handleGaugeTransitionEnd = useCallback(() => {
    setIsFull(progress >= 100)
  }, [progress])
  const handleResetGauge = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setBlinkHistory([])
    setPrevBlinked(undefined)
    e.currentTarget.blur()
  }, [])

  return (
    <div className="flex h-full">
      <div className="w-[320px] h-full bg-blue-50 p-4">
        <table className="[&_td]:py-1 [&_td]:px-2 [&_th]:px-2">
          <thead>
            <tr>
              <th className="w-9" />
              <th>観測値</th>
              <th>理論値</th>
              <th>誤差</th>
            </tr>
          </thead>
          <tbody>
            {blinkHistory.map((interval, i) => (
              <tr key={`${i}_${interval}`}>
                <td align="right">{i + 1}</td>
                <td align="right">{interval}</td>
                <td align="right">{theoreticalBlanks[i]}</td>
                <td align="right">{interval - theoreticalBlanks[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center gap-4 flex-col w-full h-full">
        <div className="size-96">
          {/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
          <video src="/video/C0FFEE.mp4" controls />
        </div>
        <div className="size-52 relative">
          <PokeBall onPressEnter={handleRecordBlink} />
          <div className="absolute top-0 size-52">
            {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
            <svg className="[&>circle]:stroke-[8]" viewBox="0 0 100 100">
              <circle fill="none" stroke="rgba(170,170,170,.3)" cx="50" cy="50" r="45" />
              <circle
                style={{
                  transition: 'stroke-dashoffset .5s ease',
                  transitionDelay: '.2s',
                }}
                fill="none"
                stroke={isFull ? '#22C55E' : '#00CCFF'}
                cx="50"
                cy="50"
                r="45"
                transform="rotate(-90 50 50)"
                strokeDasharray={Math.PI * 2 * 45}
                strokeDashoffset={(Math.PI * 2 * 45 * (100 - progress)) / 100}
                onTransitionEnd={handleGaugeTransitionEnd}
              />
            </svg>
          </div>
        </div>

        <button
          type="button"
          className="border border-black px-4 py-1 rounded"
          onClick={handleResetGauge}
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default Page
