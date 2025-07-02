'use client'

import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Select as _ } from 'radix-ui'

import { cn } from '@/cn'

const Select = _.Root

const SelectGroup = _.Group

const SelectValue = _.Value

const SelectTrigger: React.FC<React.ComponentProps<typeof _.Trigger>> = ({ className, children, ...props }) => (
  <_.Trigger
    className={cn(
      'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
      className,
    )}
    {...props}
  >
    {children}
    <_.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </_.Icon>
  </_.Trigger>
)

const SelectScrollUpButton: React.FC<React.ComponentProps<typeof _.ScrollUpButton>> = ({ className, ...props }) => (
  <_.ScrollUpButton className={cn('flex cursor-default items-center justify-center py-1', className)} {...props}>
    <ChevronUp className="h-4 w-4" />
  </_.ScrollUpButton>
)

const SelectScrollDownButton: React.FC<React.ComponentProps<typeof _.ScrollDownButton>> = ({ className, ...props }) => (
  <_.ScrollDownButton className={cn('flex cursor-default items-center justify-center py-1', className)} {...props}>
    <ChevronDown className="h-4 w-4" />
  </_.ScrollDownButton>
)

const SelectContent: React.FC<React.ComponentProps<typeof _.Content>> = ({
  className,
  children,
  position = 'popper',
  ...props
}) => (
  <_.Portal>
    <_.Content
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <_.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
        )}
      >
        {children}
      </_.Viewport>
      <SelectScrollDownButton />
    </_.Content>
  </_.Portal>
)

const SelectLabel: React.FC<React.ComponentProps<typeof _.Label>> = ({ className, ...props }) => (
  <_.Label className={cn('px-2 py-1.5 text-sm font-semibold', className)} {...props} />
)

const SelectItem: React.FC<React.ComponentProps<typeof _.Item>> = ({ className, children, ...props }) => (
  <_.Item
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <_.ItemIndicator>
        <Check className="h-4 w-4" />
      </_.ItemIndicator>
    </span>
    <_.ItemText>{children}</_.ItemText>
  </_.Item>
)

const SelectSeparator: React.FC<React.ComponentProps<typeof _.Separator>> = ({ className, ...props }) => (
  <_.Separator className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
)

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
