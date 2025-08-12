import { cn } from '@/cn'

const variants = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
} as const
type Variant = keyof typeof variants

export const Label: React.FC<React.ComponentProps<'div'> & { variant?: Variant }> = ({
  className,
  children,
  variant = 'sm',
  ...props
}) => {
  return (
    <div className={cn('leading-none text-[#333]/80 select-none', variants[variant], className)} {...props}>
      {children}
    </div>
  )
}
