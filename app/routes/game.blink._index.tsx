import { PokeBall } from '@/components/PokeBall'
import { useCallback, useMemo, useState } from 'react'

const to30fps = (ms: number) => Math.floor((ms / 1000) * 30)

const theoreticalBlanks = [22, 94, 65, 52, 22, 25, 18, 20, 77, 94, 94, 94, 43, 87]

const hyouka = (gosa: number) => {
  if (gosa === 0) return '今日から君はCoReaderだ'
  if (gosa <= 3) return 'その反射神経 誉れ高い'
  if (gosa <= 5) return 'やるな笑笑'
  if (gosa <= 10) return 'まだ頑張れる'
  return gosa < 827 ? 'そんなんじゃ検索結果出ないよ？' : 'あほしね'
}

const resultMessage = (score: number[]) => {
  const errors = score.map((interval, i) => interval - theoreticalBlanks[i])
  const maxError = errors.map((_) => Math.abs(_)).reduce((prev, cur) => Math.max(prev, cur), 0)

  return encodeURIComponent(
    [
      'ムウマの瞬きを観測しーたよ・。・',
      '',
      `観測値：${score.join(',')}`,
      `誤差：${errors.join(',')}`,
      `最大誤差：${maxError}`,
      `評価：${hyouka(maxError)}`,
      '',
      '',
    ].join('\n'),
  )
}

const Page: React.FC = () => {
  const [isFull, setIsFull] = useState(false)

  const [prevBlinked, setPrevBlinked] = useState<number | undefined>(undefined)
  const [blinkHistory, setBlinkHistory] = useState<number[]>([])

  const progress = blinkHistory.length < 1 ? 0 : (blinkHistory.length / 14) * 100

  const isMobile = useMemo(() => {
    return !matchMedia('(min-width: 768px)').matches
  }, [])
  const resultCN = useMemo(() => {
    return isMobile
      ? 'w-full min-h-[600px] bg-blue-50 p-4 flex flex-col items-center'
      : 'w-[320px] h-full bg-blue-50 p-4'
  }, [isMobile])

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
    const isFull = progress >= 100
    setIsFull(isFull)
    if (isMobile && isFull) {
      const el = document.documentElement
      setTimeout(() => {
        window.scroll({
          top: el.scrollHeight - el.clientHeight,
          behavior: 'smooth',
        })
      }, 500)
    }
  }, [progress, isMobile])
  const handleResetGauge = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setBlinkHistory([])
    setPrevBlinked(undefined)
    e.currentTarget.blur()
  }, [])

  const shareUrl = useMemo(() => {
    const tweet = resultMessage(blinkHistory)
    const shareURL = `https://twitter.com/intent/tweet?url=https://yatsuna827.github.io/CoSearchWASM/&hashtags=ムウマの瞬きを見るゲーム&text=${tweet}`
    return shareURL
  }, [blinkHistory])

  return (
    <div className="flex flex-col-reverse md:flex-row min-h-full md:h-full">
      <div className={resultCN}>
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

        {blinkHistory.length === 14 ? (
          <div className="mt-4">
            <a
              className="border py-2 px-3 bg-white font-bold inline-block"
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
            >
              結果をツイーヨ
            </a>
          </div>
        ) : null}
      </div>

      <div className="flex justify-center items-center gap-4 flex-col w-full h-full">
        <div className="size-96">
          {/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
          <video src="/CoSearchWASM/video/C0FFEE.mp4" controls playsInline />
        </div>
        <div className="size-52 relative">
          <PokeBall onFire={handleRecordBlink} />
          <div className="absolute top-0 size-52 pointer-events-none">
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
          className="border border-black px-4 py-1 rounded mb-8"
          onClick={handleResetGauge}
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default Page
