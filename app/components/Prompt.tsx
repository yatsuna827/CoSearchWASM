import { useCallback, useId, useRef, useState } from 'react'
import { LabeledInput } from './LabeledInput'

// FIXME: 素直にrender hooksにしたほうがいい気がする…
export const usePrompt = (): [() => Promise<string | null>, PromptController] => {
  const id = useId()
  const [resolveFn, setResolverFn] = useState<((val: string | null) => void) | null>(null)

  const handlePrompt = useCallback(() => {
    const el = document.getElementById(id)
    if (!el || el.tagName !== 'DIALOG') throw new Error(`${el?.tagName}`)

    const promise = new Promise<string | null>((resolve) => {
      setResolverFn(() => (v: string | null) => {
        resolve(v)
        setResolverFn(null)
      })
      const dialogEl = el as HTMLDialogElement
      dialogEl.showModal()
    })

    return promise
  }, [id])

  return [handlePrompt, { id, open: !!resolveFn, onClose: resolveFn ?? (() => {}) }] as const
}

type PromptController = {
  id: string

  open: boolean
  onClose: (value: string | null) => void
}

type PromptProps = {
  title: string
  label: string
  inputOption?: React.ComponentProps<'input'>
  controller: PromptController
}
export const Prompt: React.FC<PromptProps> = ({ controller: { id, open, onClose }, ...props }) => {
  const promptRef = useRef<HTMLDialogElement>(null)

  const handleClickBackdrop = useCallback(
    (e: React.MouseEvent<HTMLDialogElement, MouseEvent>) => {
      if (!promptRef.current) return

      if (e.currentTarget === e.target) {
        promptRef.current.close()
        onClose(null)
      }
    },
    [onClose],
  )

  return (
    <dialog
      ref={promptRef}
      id={id}
      className="p-0 mt-20 mx-10 w-auto max-h-screen border-l backdrop:bg-black/30"
      onClick={handleClickBackdrop}
    >
      {open && <PromptContent promptRef={promptRef} {...props} onClose={onClose} />}
    </dialog>
  )
}

const PromptContent: React.FC<{
  title: string
  label: string
  inputOption?: React.ComponentProps<'input'>
  onClose: PromptController['onClose']
  promptRef: React.RefObject<HTMLDialogElement>
}> = ({ title, label, onClose, inputOption, promptRef }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      if (inputRef.current) {
        onClose(inputRef.current.value)
      }

      promptRef.current?.close()
    },
    [onClose, promptRef],
  )
  const handleCancel = useCallback(() => {
    if (!promptRef.current) return

    promptRef.current.close()
    onClose(null)
  }, [onClose, promptRef])

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
