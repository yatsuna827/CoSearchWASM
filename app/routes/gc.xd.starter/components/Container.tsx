export const Container: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="font-[system-ui,sans-serif] leading-8 h-full">
      <div className="max-w-[900px] h-full mx-auto overflow-x-hidden overflow-y-scroll px-1 bg-[#f9f9f9]">
        {children}
      </div>
    </div>
  )
}
