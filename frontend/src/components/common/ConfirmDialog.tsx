import { Modal } from '@/components/common/Modal'

interface ConfirmDialogProps {
  title: string
  message: string
  isBusy?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({ title, message, isBusy = false, onConfirm, onClose }: ConfirmDialogProps) {
  return <Modal title={title} onClose={isBusy ? () => undefined : onClose}><div className="p-5"><p className="text-sm leading-6 text-slate-600">{message}</p><div className="mt-6 flex justify-end gap-3"><button disabled={isBusy} onClick={onClose} className="rounded-md px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50">Cancel</button><button disabled={isBusy} onClick={onConfirm} className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">{isBusy ? 'Deleting…' : 'Delete product'}</button></div></div></Modal>
}
