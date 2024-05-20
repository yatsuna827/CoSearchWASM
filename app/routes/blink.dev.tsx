import { useCallback, useEffect, useRef, useState } from 'react'
import { PokeBall } from '~/components/PokeBall'

const Page: React.FC = () => {
  const [progress, setProgress] = useState(0)
  const [isFull, setIsFull] = useState(false)

  return (
    <div className="flex justify-center items-center gap-4 flex-col w-full h-full">
      <div className="size-52 relative">
        <PokeBall onPressEnter={() => setProgress((x) => Math.min(100, x + 10))} />
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
              onTransitionEnd={() => {
                setIsFull(progress >= 100)
              }}
            />
          </svg>
        </div>
      </div>

      <button
        type="button"
        className="border border-black px-4 py-1 rounded"
        onClick={() => setProgress(0)}
      >
        Reset
      </button>
    </div>
  )
}

const modal = () => {
  const modalRef = useRef<HTMLDialogElement>(null)
  return (
    <>
      <button type="button" onClick={() => modalRef.current?.showModal()}>
        Open
      </button>
      <dialog
        ref={modalRef}
        className="bg-transparent w-[400px] h-[400px] open:flex justify-center items-center overflow-visible relative"
      >
        <div />
      </dialog>
    </>
  )
}

export default Page
