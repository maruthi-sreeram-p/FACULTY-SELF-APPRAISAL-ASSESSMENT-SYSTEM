import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { IconButton } from './Button'
import { cn } from '../../lib/utils'

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: {
  open: boolean; onClose: () => void; title: string; description?: string
  children?: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const node = ref.current!
    // Focus the first field, not the close button.
    const els = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE))
    ;(els.find((e) => e.matches('input,select,textarea')) ?? els.find((e) => e.dataset.close === undefined) ?? els[0])?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose() }
      if (e.key === 'Tab') {
        const all = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE))
        if (!all.length) return
        const first = all[0], last = all[all.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus()
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className="animate-fade fixed inset-0 z-50 flex items-end justify-center bg-[var(--scrim)] backdrop-blur-[3px] sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descId : undefined}
        className={cn(
          'animate-pop flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-modal border border-border-subtle bg-surface-elevated shadow-pop sm:rounded-modal',
          size === 'sm' ? 'sm:max-w-md' : size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg',
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-5">
          <div className="min-w-0">
            <h2 id={titleId} className="type-section text-base">{title}</h2>
            {description && <p id={descId} className="mt-1 text-sm text-secondary">{description}</p>}
          </div>
          <IconButton label="Close dialog" data-close onClick={onClose} className="-mr-2 -mt-1"><X size={17} /></IconButton>
        </div>
        {children && <div className="overflow-y-auto px-6 py-4">{children}</div>}
        {footer && <div className="mt-2 flex flex-col-reverse gap-2 border-t border-border-subtle bg-surface-muted/60 px-6 py-4 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>
  )
}
