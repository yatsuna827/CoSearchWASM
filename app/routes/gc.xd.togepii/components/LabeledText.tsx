import { Label } from './Label'

type Props = {
  className?: string
  label: string
  text: string
}
export const LabeledText: React.FC<Props> = ({ label, text, className }) => {
  return (
    <div className={className}>
      <Label className="mb-1">{label}</Label>
      <div className="leading-none text-[#333]">{text}</div>
    </div>
  )
}
