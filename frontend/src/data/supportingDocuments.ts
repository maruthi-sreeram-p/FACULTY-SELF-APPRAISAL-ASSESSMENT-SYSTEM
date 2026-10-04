/** Supporting-documents checklist from the Score Sheet page of the college PDF, in PDF order. */
export const SUPPORTING_DOCUMENTS = [
  { id: 'course-files', label: 'Course files & result analysis' },
  { id: 'feedback', label: 'Student feedback reports' },
  { id: 'mentoring', label: 'Mentoring records' },
  { id: 'publications', label: 'Publication proofs (with indexing)' },
  { id: 'projects', label: 'Project sanction letters' },
  { id: 'patent-book', label: 'Patent / book proofs' },
  { id: 'certificates', label: 'FDP / course certificates' },
  { id: 'orders', label: 'Role / appointment orders' },
  { id: 'event-reports', label: 'Event reports' },
  { id: 'awards', label: 'Awards / membership proofs' },
  { id: 'others', label: 'Others' },
] as const

export type DocCategoryId = (typeof SUPPORTING_DOCUMENTS)[number]['id']

export const docCategoryLabel = (id?: string) =>
  SUPPORTING_DOCUMENTS.find((c) => c.id === id)?.label ?? 'Uncategorised'
