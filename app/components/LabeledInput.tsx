import { useId } from 'react'

type Props = React.ComponentProps<'input'> & { label: string }
export const LabeledInput: React.FC<Props> = ({ label, ref, ...props }) => {
  const id = useId()

  return (
    <div>
      <label htmlFor={id} className="block text-sm text-[#333]/80 mb-1 select-none">
        {label}
      </label>
      <input {...props} ref={ref} id={id} />
    </div>
  )
}
