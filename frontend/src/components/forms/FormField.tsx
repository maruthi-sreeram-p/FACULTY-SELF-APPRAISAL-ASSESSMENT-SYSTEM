import { useId, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

export interface ControlProps {
  id: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  'aria-required'?: boolean
}

/** One look for every text input, select and textarea. Subtle border; accent border + soft ring on focus. */
export const controlCls = (invalid?: boolean, multiline?: boolean) => cn(
  'w-full rounded-control border bg-surface px-3 text-sm text-primary shadow-xs placeholder:text-muted',
  'transition-[border-color,box-shadow] duration-150 focus:outline-none focus-visible:outline-none focus:ring-[3px]',
  'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-secondary',
  multiline ? 'min-h-24 py-2 leading-relaxed' : 'h-control',
  invalid
    ? 'border-danger focus:border-danger focus:ring-danger/15'
    : 'border-border hover:border-border-strong focus:border-accent focus:ring-accent/15',
)

/** Wraps a control with a label, helper text and error message, wired for assistive tech. */
export function FormField({ label, required, hint, error, className, children }: {
  label: string; required?: boolean; hint?: string; error?: string; className?: string
  children: (p: ControlProps) => ReactNode
}) {
  const id = useId()
  const descId = `${id}-d`
  const text = error ?? hint
  return (
    <div className={className}>
      <label htmlFor={id} className="type-label mb-1.5 block text-primary">
        {label}
        {required && <><span className="ml-0.5 text-danger" aria-hidden>*</span><span className="sr-only"> (required)</span></>}
      </label>
      {children({ id, 'aria-describedby': text ? descId : undefined, 'aria-invalid': error ? true : undefined, 'aria-required': required || undefined })}
      {text && <p id={descId} className={cn('type-meta mt-1.5', error ? 'text-danger' : 'text-muted')}>{text}</p>}
    </div>
  )
}
