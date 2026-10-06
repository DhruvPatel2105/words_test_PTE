import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  title: string
  children: ReactNode
  confirmLabel: string
  cancelLabel: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Small confirmation dialog. Esc cancels; focus starts on the safe (cancel) button. */
export default function Modal({ title, children, confirmLabel, cancelLabel, danger, onConfirm, onCancel }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="presentation">
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="card w-full max-w-md">
        <h2 id="modal-title" className="text-xl font-bold">{title}</h2>
        <div className="mt-2 text-slate-700 dark:text-slate-300">{children}</div>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button ref={cancelRef} type="button" className="btn btn-secondary" onClick={onCancel}>{cancelLabel}</button>
          <button type="button" className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
