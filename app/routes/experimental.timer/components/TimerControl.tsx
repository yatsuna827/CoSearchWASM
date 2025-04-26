import { cn } from '@/cn'

import { FastForwardIcon, PauseIcon, PlayIcon, RewindIcon } from 'lucide-react'

type TimerControlProps = {
  className?: string
  isActive: boolean
  onRewind?: (frames: number) => void
  onStart: () => void
  onCancel: () => void
  onFastForward?: (frames: number) => void
}
export const TimerControl: React.FC<TimerControlProps> = ({
  className,
  isActive,
  onStart,
  onCancel,
  onRewind,
  onFastForward,
}) => {
  return (
    <div className={cn('flex justify-center w-full', className)}>
      <ControlButton className="relative mt-4" onClick={() => onFastForward?.(10)}>
        <RewindIcon size={20} className="mb-[8px] mr-1" />
        <div className="absolute bottom-[14px] text-xs pointer-events-none">10F</div>
      </ControlButton>
      <ControlButton className="relative mt-12" onClick={() => onFastForward?.(1)}>
        <RewindIcon size={20} className="mb-[8px] mr-1" />
        <div className="absolute bottom-[14px] text-xs pointer-events-none">1F</div>
      </ControlButton>

      <ControlButton className="mx-4" onClick={isActive ? onCancel : onStart}>
        {isActive ? <PauseIcon /> : <PlayIcon />}
      </ControlButton>

      <ControlButton className="relative mt-12" onClick={() => onRewind?.(1)}>
        <FastForwardIcon size={20} className="mb-[8px] ml-1" />
        <div className="absolute bottom-[14px] text-xs pointer-events-none">1F</div>
      </ControlButton>
      <ControlButton className="relative mt-4" onClick={() => onRewind?.(10)}>
        <FastForwardIcon size={20} className="mb-[8px] ml-1" />
        <div className="absolute bottom-[14px] text-xs pointer-events-none">10F</div>
      </ControlButton>
    </div>
  )
}

type ControlButtonProps = React.ComponentPropsWithRef<'button'>
const ControlButton: React.FC<ControlButtonProps> = ({ className, type = 'button', ...props }) => {
  return (
    <button
      type={type}
      className={cn(
        'grid place-items-center size-16 rounded-full bg-green-400 hover:bg-green-500 active:bg-green-600',
        className,
      )}
      {...props}
    />
  )
}
