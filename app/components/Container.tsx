export const Container: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="font-[system-ui,sans-serif] leading-8 max-w-[900px] mx-auto px-4 pt-2 pb-4 bg-[#f9f9f9]">
      {children}
    </div>
  )
}
