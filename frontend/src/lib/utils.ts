export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

export const formatDate = (iso?: string | null, withTime = false) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString(undefined, withTime
    ? { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: 'numeric', month: 'short', year: 'numeric' })
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "2025-08-14" → "14-08-2025" (the PDF's DD-MM-YYYY). */
export const formatDay = (s?: string) => {
  const m = s?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : s || ''
}

/** "2025-08" → "Aug 2025". */
export const formatMonth = (s?: string) => {
  const m = s?.match(/^(\d{4})-(\d{2})$/)
  return m ? `${MONTHS[Number(m[2]) - 1]} ${m[1]}` : s || ''
}

export const optionValue = (o: string | { value: string }) => (typeof o === 'string' ? o : o.value)
export const optionLabel = (o: string | { label: string }) => (typeof o === 'string' ? o : o.label)

export const formatSize =(b: number) =>
  b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`

export const initials = (name: string) =>
  name.replace(/^(dr|prof|mr|mrs|ms)\.?\s+/i, '').split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
