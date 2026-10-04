import { useRef, useState } from 'react'
import { AlertCircle, Check, FileText, Loader2, Trash2, UploadCloud, X } from 'lucide-react'
import { ACCEPT, MAX_MB, validateFiles } from '../../lib/files'
import { cn, formatSize } from '../../lib/utils'
import { Button, IconButton } from '../ui/Button'

export interface UploadItem {
  id: string
  name: string
  size: number
  state?: 'uploading' | 'done' | 'error'
  error?: string
  /** supporting-document checklist item (contract code) */
  documentType?: string
  /** true for a few seconds after a successful upload */
  fresh?: boolean
}

/** One file row: icon, name, size, state, delete. Shared by the drop zone list and the checklist. */
export function FileRow({ f, onRemove, compact }: { f: UploadItem; onRemove: (id: string) => void; compact?: boolean }) {
  return (
    <li className={cn('flex items-center gap-3', compact ? 'py-1.5' : 'px-3.5 py-2.5')}>
      <span aria-hidden className={cn('grid shrink-0 place-items-center rounded-control bg-surface-muted text-secondary', compact ? 'h-7 w-7' : 'h-9 w-9')}><FileText size={compact ? 14 : 17} /></span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-medium">{f.name}</p>
        <p className={cn('type-meta', f.state === 'error' ? 'text-danger' : 'text-muted')}>
          {f.state === 'error' ? (f.error ?? 'Upload failed') : formatSize(f.size)}
        </p>
      </div>
      {f.state === 'uploading' && <span className="type-meta flex items-center gap-1.5 text-secondary" role="status"><Loader2 size={14} className="animate-spin" aria-hidden />Uploading…</span>}
      {f.state === 'done' && f.fresh && (
        <span className="type-meta animate-check flex items-center gap-1 text-success" role="status"><Check size={14} aria-hidden />Uploaded</span>
      )}
      {f.state === 'error' && <AlertCircle size={16} className="text-danger" aria-hidden />}
      {f.state !== 'uploading' && (
        <IconButton label={f.state === 'error' ? `Dismiss ${f.name}` : `Delete ${f.name}`} tone="danger" onClick={() => onRemove(f.id)}>
          {f.state === 'error' ? <X size={16} /> : <Trash2 size={16} />}
        </IconButton>
      )}
    </li>
  )
}

export function FileUpload({ files, onAdd, onRemove, accept = ACCEPT, maxMB = MAX_MB, busy }: {
  files: UploadItem[]
  onAdd: (files: File[]) => void
  onRemove: (id: string) => void
  accept?: string
  maxMB?: number
  busy?: boolean
}) {
  const input = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handle = (list: FileList | null) => {
    if (!list?.length || busy) return
    const { ok, problems } = validateFiles(list, accept, maxMB)
    setError(problems.length ? problems.join(' ') : null)
    if (ok.length) onAdd(ok)
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files) }}
        className={cn('flex flex-wrap items-center gap-x-4 gap-y-3 rounded-card border border-dashed px-4 py-3.5 transition-colors duration-200',
          drag ? 'border-accent bg-accent-subtle' : 'border-border-strong bg-surface-muted/50')}
      >
        <span aria-hidden className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-control border bg-surface transition-colors duration-200',
          drag ? 'border-accent text-accent' : 'border-border text-secondary')}><UploadCloud size={19} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-medium">{drag ? 'Drop to upload' : 'Drag files here, or browse'}</p>
          <p className="type-meta text-muted">{accept.replaceAll('.', '').replaceAll(',', ', ').toUpperCase()} · up to {maxMB} MB each</p>
        </div>
        <Button variant="secondary" size="sm" disabled={busy} onClick={() => input.current?.click()}>Browse files</Button>
        <input ref={input} type="file" multiple accept={accept} className="sr-only" aria-label="Upload supporting documents"
          onChange={(e) => { handle(e.target.files); e.target.value = '' }} />
      </div>
      {error && <p role="alert" className="type-meta mt-2 flex items-center gap-1.5 text-danger"><AlertCircle size={13} aria-hidden />{error}</p>}

      {files.length > 0 && (
        <ul className="mt-3 divide-y divide-border-subtle overflow-hidden rounded-card border border-border bg-surface" aria-label="Uploaded files">
          {files.map((f) => <FileRow key={f.id} f={f} onRemove={onRemove} />)}
        </ul>
      )}
    </div>
  )
}
