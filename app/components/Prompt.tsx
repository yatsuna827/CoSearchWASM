import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useAtomCallback } from 'jotai/utils'
import { useCallback, useRef } from 'react'
import { LabeledInput } from './LabeledInput'

type PromptProps = {
  title: string
  label: string
  inputOption?: React.ComponentProps<'input'>
}

const promptPropsAtom = atom<PromptProps | null>(null)
const promptRefAtom = atom<HTMLDialogElement | null>(null)
const promptResolverAtom = atom<((val: string | null) => void) | null>(null)

export const showPromptAtom = atom(null, (get, set, props: PromptProps): Promise<string | null> => {
  const promptRef = get(promptRefAtom)
  if (!promptRef) return Promise.resolve(null)

  const promise = new Promise<string | null>((resolve) => {
    set(promptPropsAtom, props)
    set(promptResolverAtom, () => resolve)
  })

  promptRef.showModal()

  return promise
})
export const usePrompt = (): ((props: PromptProps) => Promise<string | null>) => {
  const showPrompt = useSetAtom(showPromptAtom)

  return showPrompt
}

const closePromptAtom = atom(null, (get, set, val: string | null = null) => {
  const promptRef = get(promptRefAtom)
  const onClose = get(promptResolverAtom)

  promptRef?.close()
  onClose?.(val)
  set(promptPropsAtom, null)
})

export const Prompt: React.FC = () => {
  const props = useAtomValue(promptPropsAtom)
  const setRef = useSetAtom(promptRefAtom)
  const open = props != null

  const handleClickBackdrop = useAtomCallback(
    useCallback((_get, set, e: React.MouseEvent<HTMLDialogElement, MouseEvent>) => {
      if (e.currentTarget === e.target) {
        set(closePromptAtom)
      }
    }, []),
  )

  return (
    <dialog
      ref={setRef}
      className="p-0 mt-20 mx-10 w-auto max-h-screen border-l backdrop:bg-black/30"
      onClick={handleClickBackdrop}
    >
      {/* close時にアンマウントさせないとinputの状態が初期化されない */}
      {open && <PromptContent {...props} />}
    </dialog>
  )
}

const PromptContent: React.FC<PromptProps> = ({ title, label, inputOption }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const handleSubmit = useAtomCallback(
    useCallback((_get, set, e: React.FormEvent) => {
      e.preventDefault()

      set(closePromptAtom, inputRef.current?.value ?? null)
    }, []),
  )
  const handleCancel = useAtomCallback(
    useCallback((_get, set) => {
      set(closePromptAtom)
    }, []),
  )

  return (
    <div className="p-4 w-full h-auto bg-[#f9f9f9]">
      <h1>{title}</h1>
      <form className="mt-4" onSubmit={handleSubmit}>
        <LabeledInput className="px-2 mb-4" ref={inputRef} label={label} {...inputOption} />

        <div className="flex gap-2">
          <button type="submit" className="w-20 h-8 text-sm border font-semibold bg-white">
            Submit
          </button>
          <button type="button" className="w-20 h-8 text-sm border bg-white" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
