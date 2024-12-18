import { type ComponentProps, forwardRef, useId } from 'react'

type LabeledInputProps = ComponentProps<'input'> & { label: string }
export const LabeledInput = forwardRef<HTMLInputElement, LabeledInputProps>(
  ({ label, ...props }, ref) => {
    const id = useId()

    return (
      <div>
        <label htmlFor={id} className="block text-sm text-[#333]/80 mb-1 select-none">
          {label}
        </label>
        <input {...props} ref={ref} id={id} />
      </div>
    )
  },
)
