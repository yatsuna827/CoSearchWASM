import { cn } from '@/cn'

type TimerProps = {
  className?: string
  progress: number
  children?: React.ReactNode
}
export const Timer: React.FC<TimerProps> = ({ className, children, progress }) => {
  return (
    <div className={className}>
      <div className="text-8xl font-semibold flex justify-center w-full">{children}</div>

      <TimerBar className="mt-4" progress={progress} />
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
      <div
        className="h-4 rounded-l-lg bg-blue-400 absolute left-0"
        style={{ width: 500 * progress }}
      />
    </div>
  )
}
