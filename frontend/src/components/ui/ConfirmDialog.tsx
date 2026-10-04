import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from './Button'
import { Modal } from './Modal'

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'primary', icon, loading, onConfirm, onCancel, children }: {
  open: boolean; title: string; message: string; confirmLabel?: string; cancelLabel?: string
  tone?: 'primary' | 'danger'; icon?: ReactNode; loading?: boolean
  onConfirm: () => void; onCancel: () => void; children?: ReactNode
}) {
  const glyph = icon ?? (tone === 'danger' ? <AlertTriangle size={18} /> : null)
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm"
      footer={<>
        <Button variant="secondary" onClick={onCancel} className="max-sm:w-full">{cancelLabel}</Button>
        <Button variant={tone} loading={loading} onClick={onConfirm} className="max-sm:w-full">{confirmLabel}</Button>
      </>}>
      <div className="flex gap-4">
        {glyph && (
          <span aria-hidden className={cn('mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full',
            tone === 'danger' ? 'bg-danger-subtle text-danger' : 'bg-accent-subtle text-accent')}>{glyph}</span>
        )}
        <div className="min-w-0 text-sm text-secondary">
          <p>{message}</p>
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </Modal>
  )
}
