type RowProps = {
  i: number
  tid: number
  sid: number
}
export const Row: React.FC<RowProps> = ({ i, tid, sid }) => {
  return (
    <div className="flex items-center gap-2 border-b h-10">
      <div className="w-16 text-center text-gray-500">{i}</div>
      <div className="align-baseline">
        <span className="text-lg text-[#333]">{tid.toString().padStart(5, '0')}</span>
        <span className="text-xs text-[#333] ml-2">{sid.toString().padStart(5, '0')}</span>
      </div>
    </div>
  )
}
