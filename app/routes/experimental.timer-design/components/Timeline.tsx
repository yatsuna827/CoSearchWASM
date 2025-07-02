import { cn } from '@/cn'
import type React from 'react'

type TimelineProps = {
  events: { label: string; seed: string; active?: boolean }[]
  className?: string
}

export const Timeline: React.FC<TimelineProps> = ({ events, className }) => {
  return (
    <div className={cn('w-full grid grid-cols-[auto_auto_1fr] gap-x-2', className)}>
      {events.map((event, idx) => (
        <TimelineItem
          key={event.seed}
          lineStyle={idx === events.length - 1 ? 'dashed' : 'solid'}
          leftContent={((1 << (idx * 7)) >>> 0) - 1}
          rightContent={
            <>
              <div className={cn('text-sm', event.active && 'font-bold text-blue-700')}>{event.seed}</div>
              <div className="text-xs text-[#333]">{event.label}</div>
            </>
          }
        />
      ))}
    </div>
  )
}

type TimelineItemProps = {
  active?: boolean
  lineStyle?: 'solid' | 'dashed'
  leftContent?: React.ReactNode
  rightContent?: React.ReactNode
}
const TimelineItem: React.FC<TimelineItemProps> = ({ active, lineStyle = 'solid', leftContent, rightContent }) => {
  return (
    <div className="grid grid-cols-subgrid col-span-3 h-16">
      <div className="mt-[2px] justify-self-end">
        <div className="text-xs text-[#333] min-w-4 flex justify-end">{leftContent}</div>
      </div>

      <div className="relative w-3">
        <div
          className={cn('absolute left-[5px] top-[5px] w-0 border h-16', lineStyle === 'dashed' && 'border-dashed')}
        />
        <div
          data-active={active ?? undefined}
          className="absolute size-3 top-[5px] rounded-full border-2 border-blue-300 bg-white data-[active]:bg-blue-500 data-[active]:border-blue-700"
        />
      </div>

      <div>{rightContent}</div>
    </div>
  )
}
