import { cn } from '@/cn'
import { Container } from '@/components/Container'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/Sheet'
import { History, TriangleAlertIcon } from 'lucide-react'
import { useState } from 'react'
import { Timeline } from './components/Timeline'
import { Timer } from './components/Timer'
import { TimerControl } from './components/TimerControl'

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
