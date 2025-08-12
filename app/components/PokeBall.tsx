import { useCallback, useEffect, useRef } from 'react'

type Props = {
  onFire?: () => void
}
export const PokeBall: React.FC<Props> = ({ onFire }) => {
  const pulseClass =
    'animate-pulsate absolute inline-flex size-[160px] rounded-full border border-orange-500 opacity-75 pointer-events-none'
  const pulseRef = useRef<HTMLDivElement>(null)
  const animatePulse = useCallback(() => {
    if (pulseRef.current == null) return
    pulseRef.current.className = ''

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (pulseRef.current == null) return

        pulseRef.current.className = pulseClass
      })
    })
  }, [])

  const handleFire = useCallback(() => {
    animatePulse()
    onFire?.()
  }, [animatePulse, onFire])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleFire()
      }
    }
    document.addEventListener('keydown', handler)

    return () => {
      document.removeEventListener('keydown', handler)
    }
  }, [handleFire])

  return (
    <div className="w-full h-full flex justify-center items-center relative">
      <div className="flex justify-center items-center size-40 rounded-full bg-gradient-poke-ball" onClick={handleFire}>
        <div className="rounded-full border-[7px] border-black size-10 box-content bg-[#F5F5F5] flex items-center justify-center relative">
          <div className="rounded-full size-5 shadow-lg bg-white" />
          <div
            ref={pulseRef}
            onAnimationEnd={() => {
              if (pulseRef.current) pulseRef.current.className = ''
            }}
          />
        </div>
      </div>
    </div>
  )
}
