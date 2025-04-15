'use client'

import { Check } from 'lucide-react'
import { Checkbox as _ } from 'radix-ui'

import { cn } from '@/cn'

const Checkbox: React.FC<React.ComponentProps<typeof _.Root>> = ({ className, ...props }) => (
  <_.Root
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      className,
    )}
    {...props}
  >
    <_.Indicator className={cn('flex items-center justify-center text-current')}>
      <Check className="h-4 w-4" />
    </_.Indicator>
  </_.Root>
)

export { Checkbox }
