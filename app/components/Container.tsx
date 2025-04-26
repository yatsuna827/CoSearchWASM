import { cn } from '@/cn'

export const Container: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'font-[system-ui,sans-serif] leading-8 min-h-full max-w-[900px] mx-auto px-8 pt-4 pb-4 bg-[#f9f9f9]',
        className,
      )}
    >
      {children}
    </div>
  )
}
