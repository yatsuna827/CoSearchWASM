import { cn } from '@/cn'
import { Container } from '@/components/Container'
import { Hamburger } from '@/components/Hamburger'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/Sheet'
import {
  FastForwardIcon,
  History,
  PauseIcon,
  PlayIcon,
  RewindIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Timeline } from './components/Timeline'

// サンプル時系列データ
const timelineEvents = [
  { label: '特定 @ とにかくバトル', seed: 'A1B2C3D4' },
  { label: '再特定 @ 瞬き', seed: 'FFFFFFFF' },
  { label: '再特定 @ 瞬き', seed: '82782782' },
  { label: '再特定 @ 瞬き', seed: 'BEEFFACE', active: true },
  { label: '目標', seed: '00C0FFEE' },
]

const Index: React.FC = () => {
  const [isActive, setIsActive] = useState(false)

  return (
    <Sheet modal={false}>
      <div className="relative flex items-center justify-center px-4 h-14 border-b">
        <h1 className="text-lg font-semibold">XD 瞬きタイマー</h1>
        <SheetTrigger className="absolute right-4">
          <History className="h-6 w-6 stroke-gray-600" />
        </SheetTrigger>
      </div>
      <Container className="flex flex-col">
        <div className="grid place-content-center h-60">
          <Timer className="pt-10" />
        </div>

        <TimerControl
          className="mb-10"
          isActive={isActive}
          onStart={() => setIsActive(true)}
          onCancel={() => setIsActive(false)}
        />

        <DurationsContainer className="flex-1">
          <DurationsItem frames={16} seed="41C64E6D" />
          <DurationsItem className="opacity-55" frames={195} seed="41C64E6D" dangerous />
          <DurationsItem className="opacity-30" frames={16} seed="41C64E6D" />
          <DurationsItem className="opacity-30" frames={16} seed="41C64E6D" />
          <DurationsItem className="opacity-30" frames={16} seed="41C64E6D" />
        </DurationsContainer>
      </Container>

      <SheetContent
        side="right"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <SheetHeader>
          <SheetTitle>Seed History</SheetTitle>
          <SheetDescription />
        </SheetHeader>

        <Timeline events={timelineEvents} className="mb-8" />
      </SheetContent>
    </Sheet>
  )
}

type TimerProps = {
  className?: string
}
const Timer: React.FC<TimerProps> = ({ className }) => {
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
type TimerBarProps = { className?: string; progress: number }
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

type TimerControlProps = {
  className?: string
  isActive: boolean
  onRewind?: (frames: number) => void
  onStart: () => void
  onCancel: () => void
  onFastForward?: (frames: number) => void
}
const TimerControl: React.FC<TimerControlProps> = ({
  className,
  isActive,
  onStart,
  onCancel,
  onRewind,
  onFastForward,
}) => {
  return (
    <div className={cn('flex justify-center w-full', className)}>
      <ControlButton className="relative mt-4" onClick={() => onRewind?.(10)}>
        <RewindIcon size={20} className="mb-[8px] mr-1" />
        <div className="absolute bottom-[14px] text-xs pointer-events-none">10F</div>
      </ControlButton>
      <ControlButton className="relative mt-12" onClick={() => onRewind?.(1)}>
        <RewindIcon size={20} className="mb-[8px] mr-1" />
        <div className="absolute bottom-[14px] text-xs pointer-events-none">1F</div>
      </ControlButton>

      <ControlButton className="mx-4" onClick={isActive ? onCancel : onStart}>
        {isActive ? <PauseIcon /> : <PlayIcon />}
      </ControlButton>

      <ControlButton className="relative mt-12" onClick={() => onFastForward?.(1)}>
        <FastForwardIcon size={20} className="mb-[8px] ml-1" />
        <div className="absolute bottom-[14px] text-xs pointer-events-none">1F</div>
      </ControlButton>
      <ControlButton className="relative mt-4" onClick={() => onFastForward?.(10)}>
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

// ---

type DurationsContainerProps = {
  className?: string
  children: React.ReactNode
}
const DurationsContainer: React.FC<DurationsContainerProps> = ({ className, children }) => {
  return <div className={cn('bg-white flex flex-col gap-2 px-40', className)}>{children}</div>
}
type DurationsItemProps = {
  className?: string
  dangerous?: boolean
  frames: number
  seed: string
}
const DurationsItem: React.FC<DurationsItemProps> = ({ className, frames, seed, dangerous }) => {
  return (
    <div className={cn('rounded-md flex bg-red-200', className)}>
      <div className="w-10 px-4 py-2">{frames}F</div>
      <div className="flex-1 ml-auto px-4 py-2">{seed}</div>
      {dangerous && (
        <div className="px-4 grid place-items-center">
          <TriangleAlertIcon />
        </div>
      )}
    </div>
  )
}

export default Index
