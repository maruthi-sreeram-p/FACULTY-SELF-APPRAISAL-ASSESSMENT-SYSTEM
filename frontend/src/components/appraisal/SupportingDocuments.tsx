import { useState } from 'react'
import { AlertCircle, Paperclip } from 'lucide-react'
import { SUPPORTING_DOCUMENTS } from '../../data/supportingDocuments'
import { ACCEPT, validateFiles } from '../../lib/files'
import type { DocumentsApi } from '../../lib/useDocuments'
import type { FieldValues } from '../../types'
import { cn } from '../../lib/utils'
import { FileRow } from '../forms/FileUpload'
import { controlCls } from '../forms/FormField'
import { Card } from '../ui/Card'

/**
 * "Supporting documents enclosed" checklist from the PDF (11 items, the last being "Others: ____").
 * Ticking an item records that the document is enclosed; files can be attached to each item.
 */
export function SupportingDocuments({ year, docs, enclosed, onEnclosed, readOnly }: {
  year: string; docs: DocumentsApi; enclosed: FieldValues; onEnclosed: (v: FieldValues) => void; readOnly: boolean
}) {
  const [error, setError] = useState<string | null>(null)

  const attach = async (id: string, list: FileList | null) => {
    if (!list?.length) return
    const { ok, problems } = validateFiles(list)
    setError(problems.length ? problems.join(' ') : null)
    if (!ok.length) return
    const ids = await docs.add(ok, year, id)
    if (ids.length && enclosed[id] !== 'true') onEnclosed({ ...enclosed, [id]: 'true' })
  }

  return (
    <Card pad="none">
      <div className="border-b border-border-subtle px-5 py-4 sm:px-6">
        <h2 className="type-section">Supporting documents enclosed</h2>
        <p className="mt-1 text-[13px] text-secondary">Tick each document you are enclosing, and attach the files for it. Accepted: {ACCEPT.replaceAll('.', '').replaceAll(',', ', ').toUpperCase()}.</p>
      </div>
      {docs.error && <p role="alert" className="px-5 py-3 text-[13px] text-danger">{docs.error}</p>}
      <ul>
        {SUPPORTING_DOCUMENTS.map((c) => {
          const files = docs.items.filter((i) => (i.category ?? 'others') === c.id)
          const done = files.filter((f) => f.state === 'done').length
          const on = enclosed[c.id] === 'true'
          return (
            <li key={c.id} className="border-b border-border-subtle px-5 py-3 last:border-0 sm:px-6">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <label className={cn('flex min-w-0 flex-1 items-center gap-3 text-[13.5px]', !readOnly && 'cursor-pointer')}>
                  <input type="checkbox" checked={on} disabled={readOnly} onChange={(e) => onEnclosed({ ...enclosed, [c.id]: String(e.target.checked) })}
                    className="h-4 w-4 shrink-0 accent-[var(--accent-solid)]" />
                  <span>{c.label}</span>
                </label>
                <span className="type-meta tabular-nums text-muted">{done} {done === 1 ? 'file' : 'files'}</span>
                {!readOnly && (
                  <label className="inline-flex h-control-sm cursor-pointer items-center gap-2 rounded-control border border-border bg-surface px-3 text-[13px] font-medium shadow-xs transition duration-150 hover:border-border-strong hover:bg-surface-muted has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent">
                    <Paperclip size={14} aria-hidden /> Attach
                    <input type="file" multiple accept={ACCEPT} className="sr-only" aria-label={`Attach files: ${c.label}`}
                      onChange={(e) => { attach(c.id, e.target.files); e.target.value = '' }} />
                  </label>
                )}
              </div>
              {c.id === 'others' && (
                <div className="mt-3 max-w-md">
                  <label className="block">
                    <span className="type-label mb-1.5 block">Others: specify</span>
                    <input type="text" disabled={readOnly} value={enclosed.othersSpecify ?? ''} onChange={(e) => onEnclosed({ ...enclosed, othersSpecify: e.target.value })} className={controlCls()} />
                  </label>
                </div>
              )}
              {files.length > 0 && (
                <ul className="mt-2 divide-y divide-border-subtle border-l-2 border-border-subtle pl-3" aria-label={`Files: ${c.label}`}>
                  {files.map((f) => <FileRow key={f.id} f={f} compact onRemove={docs.remove} />)}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
      {error && <p role="alert" className="type-meta flex items-center gap-1.5 border-t border-border-subtle px-5 py-3 text-danger"><AlertCircle size={13} aria-hidden />{error}</p>}
    </Card>
  )
}
