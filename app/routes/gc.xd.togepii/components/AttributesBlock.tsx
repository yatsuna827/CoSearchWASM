import { cn } from '@/cn'
import type { Attributes } from '@/domain/type'

const p = (val: number, n?: number) => (n != null ? val.toString().padStart(n, '0') : val)

type Props = {
  className?: string
  attributes: Attributes
  pad?: number
}
export const AttributesBlock: React.FC<Props> = ({ pad, className, attributes }) => {
  return (
    <div className={cn('flex gap-2 text-base leading-none text-[#333]', className)}>
      <div>{p(attributes[0], pad)}</div>
      <div>{p(attributes[1], pad)}</div>
      <div>{p(attributes[2], pad)}</div>
      <div>{p(attributes[3], pad)}</div>
      <div>{p(attributes[4], pad)}</div>
      <div>{p(attributes[5], pad)}</div>
    </div>
  )
}
