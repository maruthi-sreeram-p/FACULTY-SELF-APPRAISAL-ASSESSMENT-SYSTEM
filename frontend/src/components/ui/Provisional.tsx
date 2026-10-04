import { Info } from 'lucide-react'

/**
 * Marks anything the college PDF does not define. Never silently invent institutional rules:
 * label them so the college can confirm or replace them.
 */
export function ProvisionalTag({ note }: { note: string }) {
  return (
    <span
      title={`Provisional, requires college confirmation. ${note}`}
      className="type-meta inline-flex items-center gap-1 rounded-md bg-warning-subtle px-1.5 py-0.5 font-medium text-warning ring-1 ring-inset ring-warning/20"
    >
      <Info size={11} aria-hidden /> Provisional
      <span className="sr-only">: requires college confirmation. {note}</span>
    </span>
  )
}

export function ProvisionalNotice({ note }: { note: string }) {
  return (
    <div role="note" className="flex items-start gap-3 rounded-card border border-warning/25 bg-warning-subtle px-4 py-3 text-[13px] text-primary">
      <Info size={16} aria-hidden className="mt-0.5 shrink-0 text-warning" />
      <p><span className="font-semibold text-warning">Provisional, requires college confirmation. </span><span className="text-secondary">{note}</span></p>
    </div>
  )
}
