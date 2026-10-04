export type AppraisalStatus =
  | 'not_started' | 'draft' | 'in_progress' | 'submitted' | 'under_review' | 'approved' | 'returned' | 'rejected'

export interface Profile {
  id: string
  name: string
  email: string
  designation: string
  cadre?: string
  department: string
  employeeId?: string
  avatarUrl?: string | null
}

/* ------------------------------------------------------------------ */
/* Form schema (see src/data/appraisalSchema.ts and docs/ui/)          */
/* ------------------------------------------------------------------ */

export type FieldType =
  | 'text' | 'textarea' | 'number' | 'date' | 'month' | 'select'
  | 'combobox'   // free text with suggested values
  | 'daterange'  // "Duration (From–To)": stored as `${key}From` and `${key}To`
  | 'checkbox'

export type Option = string | { value: string; label: string }

export interface FieldDef {
  key: string
  label: string
  type: FieldType
  required?: boolean
  hint?: string
  placeholder?: string
  options?: Option[]
  /** show as a column in the table summary (row fields only) */
  summary?: boolean
  /** span the full width of the form grid */
  wide?: boolean
  min?: number
  max?: number
  step?: number
}

interface BlockBase {
  /** unique within its step */
  id: string
  title?: string
  description?: string
  /** offer a "nothing to report here" switch (default true) */
  allowNone?: boolean
  /** may stay empty without affecting section status (summary counts, "if pursuing" blocks); no switch is shown */
  optional?: boolean
  /** must be complete before the appraisal can be submitted (UI rule) */
  mandatory?: boolean
  /** marks the block as not defined by the college PDF */
  provisional?: string
}

export interface FieldsBlockDef extends BlockBase {
  kind: 'fields'
  fields: FieldDef[]
  columns?: 1 | 2 | 3 | 4
  note?: string
}

export interface TableBlockDef extends BlockBase {
  kind: 'table'
  rowLabel: string
  rowFields: FieldDef[]
}

export interface MatrixBlockDef extends BlockBase {
  kind: 'matrix'
  rowHeader: string
  rows: { key: string; label: string }[]
  cols: { key: string; label: string }[]
}

export type BlockDef = FieldsBlockDef | TableBlockDef | MatrixBlockDef

export interface SectionDef {
  id: string
  title: string
  /** short label for the section tab */
  tabLabel?: string
  description?: string
  provisional?: string
  blocks: BlockDef[]
}

export type StepKind = 'sections' | 'scores' | 'official' | 'review'

export interface StepDef {
  id: string
  title: string
  description: string
  kind: StepKind
  /** stepper group heading */
  part: string
  /** where this step sits in the college PDF */
  pdfRef: string
  /** short code shown in the stepper (A, B1 … B11) */
  code?: string
  sections?: SectionDef[]
  official?: 'hod' | 'principal'
  provisional?: string
}

/* ------------------------------------------------------------------ */
/* Appraisal data                                                      */
/* ------------------------------------------------------------------ */

export interface Row {
  id: string
  [key: string]: string
}

export type FieldValues = Record<string, string>
export type BlockValue = FieldValues | Row[]
/** blockId → value. "<blockId>:none" holds the "nothing to report" switch. */
export type StepData = Record<string, BlockValue>
export type AppraisalData = Record<string, StepData>

/** Supplied by the backend. The frontend never calculates these. */
export interface ScoreSummary {
  maxScore: number
  selfScore: number
  /** optional per-criterion self-scores keyed by criterion id */
  criteria?: Record<string, number>
}

export interface OfficialReview {
  remarks: string
  /** confirmation / signature */
  signedBy?: string
  signedAt?: string
}

export interface AppraisalDraft {
  year: string
  status: AppraisalStatus
  updatedAt: string | null
  data: AppraisalData
  scores: ScoreSummary | null
  /** HoD recommendations and Principal remarks: filled by those officers, read-only here */
  reviews?: { hod?: OfficialReview | null; principal?: OfficialReview | null }
}

export interface AppraisalSummary {
  year: string
  status: AppraisalStatus
  completion: number
  updatedAt: string | null
}

export interface DashboardData {
  year: string
  status: AppraisalStatus
  completion: number
  scores: ScoreSummary | null
  pendingSections: { stepId: string; title: string }[]
  documentCount: number
  activity: { id: string; text: string; at: string }[]
}

export interface DocumentItem {
  id: string
  name: string
  size: number
  uploadedAt: string
  year: string
  /** supporting-document checklist category id */
  category?: string
}

export interface NotificationItem {
  id: string
  title: string
  body: string
  at: string
  read: boolean
}

export interface ReportItem {
  id: string
  title: string
  year: string
  url: string
}
