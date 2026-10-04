import type { SupportingDocumentType } from '../contract/dto'

/** "Supporting documents enclosed" checklist from the Score Sheet page of the college PDF, in PDF order. */
export const SUPPORTING_DOCUMENTS: readonly { code: SupportingDocumentType; label: string }[] = [
  { code: 'COURSE_FILES_RESULT_ANALYSIS', label: 'Course files & result analysis' },
  { code: 'STUDENT_FEEDBACK_REPORTS', label: 'Student feedback reports' },
  { code: 'MENTORING_RECORDS', label: 'Mentoring records' },
  { code: 'PUBLICATION_PROOFS', label: 'Publication proofs (with indexing)' },
  { code: 'PROJECT_SANCTION_LETTERS', label: 'Project sanction letters' },
  { code: 'PATENT_BOOK_PROOFS', label: 'Patent / book proofs' },
  { code: 'FDP_COURSE_CERTIFICATES', label: 'FDP / course certificates' },
  { code: 'ROLE_APPOINTMENT_ORDERS', label: 'Role / appointment orders' },
  { code: 'EVENT_REPORTS', label: 'Event reports' },
  { code: 'AWARDS_MEMBERSHIP_PROOFS', label: 'Awards / membership proofs' },
  { code: 'OTHERS', label: 'Others' },
]

export const docTypeLabel = (code?: string) => SUPPORTING_DOCUMENTS.find((c) => c.code === code)?.label ?? 'Uncategorised'
