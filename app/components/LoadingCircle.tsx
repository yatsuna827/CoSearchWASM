import { cn } from '@/cn'

const Container: React.FC<React.ComponentProps<'div'>> = ({ className, ...props }) => {
  return <div className={cn('flex justify-center items-center', className)} aria-label="loading" {...props} />
}

const Spinner: React.FC<React.ComponentProps<'div'>> = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-spin h-10 w-10 border-4 border-blue-300 rounded-full border-t-transparent', className)}
      {...props}
    />
  )
}

export const LoadingCircle = {
  Container,
  Spinner,
}
