import { PokeBall } from '@/components/PokeBall'

type BlinkRecorderProps = {
  isFull: boolean
  progress: number
  onRecord: () => void
  onGaugeTransitionEnd: () => void
}
export const BlinkRecorder: React.FC<BlinkRecorderProps> = ({ isFull, progress, onRecord, onGaugeTransitionEnd }) => {
  return (
    <div className="size-52 relative">
      <PokeBall onFire={onRecord} />
      <div className="absolute top-0 size-52 pointer-events-none">
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
            onTransitionEnd={onGaugeTransitionEnd}
          />
        </svg>
      </div>
    </div>
  )
}
