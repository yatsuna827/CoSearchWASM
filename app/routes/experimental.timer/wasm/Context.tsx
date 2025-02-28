import { type PropsWithChildren, createContext, use, useContext, useRef } from 'react'
import { type LoadWASMReturn, loadWASM } from './loadWASM'

const Context = createContext<LoadWASMReturn | undefined>(undefined)

export const WASMProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const wasmRef = useRef(loadWASM())

  return <Context.Provider value={wasmRef.current}>{children}</Context.Provider>
}

export const useWASM = () => {
  const value = useContext(Context)
  if (value === undefined) throw new Error('初期化前に呼び出されたが？？？')

  return use(value)
}
