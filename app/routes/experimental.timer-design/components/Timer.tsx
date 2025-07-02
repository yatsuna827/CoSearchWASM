import { cn } from '@/cn'

type TimerProps = {
  className?: string
}
export const Timer: React.FC<TimerProps> = ({ className }) => {
  const timeRemain = '12:34'

  return (
    <div className={className}>
      <div className="text-8xl font-semibold flex justify-center w-full">
        <span>{timeRemain}</span>
      </div>

      <TimerBar className="mt-4" progress={72 / 188} />
    </div>
  )
}

type TimerBarProps = {
  className?: string
  progress: number
}
const TimerBar: React.FC<TimerBarProps> = ({ className, progress }) => {
  return (
    <div className={cn('relative h-4 rounded-lg w-[500px] bg-blue-100', className)}>
      <div className="h-4 rounded-l-lg bg-blue-400 absolute left-0" style={{ width: 500 * progress }} />
    </div>
  )
}
