import { useMemo, useState } from 'react'
import { FileText, FolderOpen, Search, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { SUPPORTING_DOCUMENTS, docTypeLabel } from '../data/supportingDocuments'
import { useDocuments } from '../lib/useDocuments'
import { formatDate, formatSize } from '../lib/utils'
import { FileUpload } from '../components/forms/FileUpload'
import { controlCls } from '../components/forms/FormField'
import { DataTable } from '../components/tables/DataTable'
import { IconButton } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState, ErrorState, TableSkeleton } from '../components/ui/States'
import type { DocumentDto, SupportingDocumentType } from '../contract/dto'

export default function Documents() {
  const { year } = useApp()
  const { docs, items, loading, error, reload, add, remove, busy } = useDocuments()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<SupportingDocumentType>('OTHERS')
  const [deleting, setDeleting] = useState<DocumentDto | null>(null)
  const shown = useMemo(() => docs.filter((d) => d.fileName.toLowerCase().includes(query.toLowerCase())), [docs, query])

  return (
    <>
      <PageHeader title="Documents" description="Supporting documents for your appraisals. Uploads are attached to the academic year selected above." />
      <div className="space-y-5">
        <Card>
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="type-section">Upload documents</h2>
            <span className="type-meta rounded-md bg-accent-subtle px-2 py-0.5 font-medium tabular-nums text-accent">{year}</span>
          </div>
          <label className="mb-3 block max-w-sm">
            <span className="type-label mb-1.5 block">Supporting document type</span>
            <select value={category} onChange={(e) => setCategory(e.target.value as SupportingDocumentType)} className={controlCls()}>
              {SUPPORTING_DOCUMENTS.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </label>
          {/* only in-flight / failed uploads are listed here; finished files appear in the table below */}
          <FileUpload files={items.filter((i) => i.state !== 'done' || i.fresh)} busy={busy} onAdd={(f) => add(f, year, category)} onRemove={remove} />
        </Card>

        <Card pad="none">
          <div className="flex flex-wrap items-center gap-3 border-b border-border-subtle px-5 py-3.5">
            <div className="flex-1">
              <h2 className="type-section">All documents</h2>
              <p className="type-meta text-muted">{docs.length} {docs.length === 1 ? 'file' : 'files'}</p>
            </div>
            <label className="relative w-full sm:w-60">
              <span className="sr-only">Search documents</span>
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search documents"
                className={`${controlCls()} h-control-sm! pl-9`} />
            </label>
          </div>
          {loading ? <TableSkeleton rows={3} />
            : error ? <ErrorState message={error} onRetry={reload} />
            : shown.length === 0 ? (
              <EmptyState icon={<FolderOpen size={22} />} title={docs.length ? 'No matching documents' : 'No documents yet'}
                description={docs.length ? 'Try a different search term.' : 'Upload certificates, letters or other evidence to support your appraisal.'} />
            ) : (
              <div className="p-3 sm:p-0">
                <DataTable caption="Uploaded documents" rows={shown} rowKey={(d) => d.id}
                  columns={[
                    { key: 'name', header: 'Name', render: (d) => <span className="inline-flex items-center gap-2.5"><FileText size={16} className="shrink-0 text-muted" aria-hidden /><span className="truncate font-medium">{d.fileName}</span></span> },
                    { key: 'category', header: 'Document type', render: (d) => <span className="text-secondary">{docTypeLabel(d.documentType)}</span> },
                    { key: 'year', header: 'Year', render: (d) => <span className="tabular-nums">{d.academicYear}</span> },
                    { key: 'size', header: 'Size', align: 'right', render: (d) => formatSize(d.sizeBytes) },
                    { key: 'at', header: 'Uploaded', render: (d) => <span className="text-secondary">{formatDate(d.uploadedAt)}</span> },
                  ]}
                  actions={(d) => <IconButton label={`Delete ${d.fileName}`} tone="danger" onClick={() => setDeleting(d)}><Trash2 size={15} /></IconButton>} />
              </div>
            )}
        </Card>
      </div>
      <ConfirmDialog open={!!deleting} tone="danger" title="Delete this document?" confirmLabel="Delete document"
        message={`“${deleting?.fileName}” will be permanently removed from your documents.`} onCancel={() => setDeleting(null)}
        onConfirm={() => { remove(deleting!.id); setDeleting(null) }} />
    </>
  )
}
