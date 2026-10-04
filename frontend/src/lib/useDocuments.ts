import { useCallback, useState } from 'react'
import { errorMessage, services } from './api'
import { useAsync } from './useAsync'
import { useToast } from '../context/ToastContext'
import type { UploadItem } from '../components/forms/FileUpload'

/** Shared by the Documents page and the appraisal "Score Sheet & Supporting Documents" step. */
export function useDocuments(year?: string) {
  const toast = useToast()
  const q = useAsync(() => services.documents(), [])
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<UploadItem[]>([])
  const [fresh, setFresh] = useState<string[]>([])
  const docs = (q.data ?? []).filter((d) => !year || d.year === year)

  /** Resolves with the ids of the documents that were uploaded successfully. */
  const add = useCallback(async (files: File[], forYear: string, category = 'others'): Promise<string[]> => {
    setBusy(true)
    const batch: UploadItem[] = files.map((f) => ({ id: `p-${crypto.randomUUID()}`, name: f.name, size: f.size, state: 'uploading', category }))
    setPending((p) => [...batch, ...p])
    const ids: string[] = []
    let failed = 0
    await Promise.all(files.map(async (f, i) => {
      try {
        // NOTE: only metadata is sent in mock mode. A real backend would receive multipart file content here.
        const d = await services.addDocument({ name: f.name, size: f.size, year: forYear, category })
        ids.push(d.id)
        setPending((p) => p.filter((x) => x.id !== batch[i].id))
      } catch (e) {
        failed++
        setPending((p) => p.map((x) => (x.id === batch[i].id ? { ...x, state: 'error', error: errorMessage(e) } : x)))
      }
    }))
    if (ids.length) {
      toast(`${ids.length} ${ids.length === 1 ? 'file' : 'files'} uploaded`, 'success')
      setFresh((s) => [...s, ...ids])
      setTimeout(() => setFresh((s) => s.filter((x) => !ids.includes(x))), 4000)
      q.reload()
    }
    if (failed) toast(`${failed} ${failed === 1 ? 'file' : 'files'} failed to upload`, 'error')
    setBusy(false)
    return ids
  }, [q, toast])

  const remove = useCallback(async (id: string) => {
    if (id.startsWith('p-')) { setPending((p) => p.filter((x) => x.id !== id)); return }
    try { await services.deleteDocument(id); toast('Document deleted', 'success'); q.reload() }
    catch (e) { toast(errorMessage(e), 'error') }
  }, [q, toast])

  const items: UploadItem[] = [
    ...pending,
    ...docs.map((d) => ({ id: d.id, name: d.name, size: d.size, category: d.category, state: 'done' as const, fresh: fresh.includes(d.id) })),
  ]

  return { docs, items, loading: q.loading, error: q.error, reload: q.reload, add, remove, busy }
}

export type DocumentsApi = ReturnType<typeof useDocuments>
