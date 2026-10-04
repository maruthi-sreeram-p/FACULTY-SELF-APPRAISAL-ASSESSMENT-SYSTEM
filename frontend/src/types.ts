import type { AppraisalStatus, ScoreSheetDto } from './contract/dto'

/* ------------------------------------------------------------------ */
/* UI form schema (see src/data/appraisalSchema.ts and docs/ui/)       */
/* Wire types live in src/contract/dto.ts.                             */
/* ------------------------------------------------------------------ */

export type FieldType =
  | 'text' | 'textarea' | 'number' | 'date' | 'month' | 'select'
  | 'combobox'   // free text with suggested values
  | 'daterange'  // "Duration (From–To)": wire keys `${key}From` and `${key}To`
  | 'checkbox'

/** `value` is the contract enum code, `label` the PDF wording, `short` the compact table form. */
export type Option = string | { value: string; label: string; short?: string }

export interface FieldDef {
  /** also the contract (wire) property name */
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
  /** displayed but not editable (value set by the server) */
  readOnly?: boolean
  min?: number
  max?: number
  step?: number
}

interface BlockBase {
  /** the block's path in the contract, e.g. "teaching.entries". Unique, and used as the form-state key. */
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

/** Rows × columns of numbers. Row keys are contract enum codes (e.g. GOOGLE_SCHOLAR); column keys are DTO property names. */
export interface MatrixBlockDef extends BlockBase {
  kind: 'matrix'
  rowHeader: string
  /** name of the row-key property in each wire row, e.g. "platform" */
  rowKeyField: string
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
/* Form state: strings for every input. Converted to/from the wire     */
/* shape by src/contract/mapper.ts.                                    */
/* ------------------------------------------------------------------ */

export interface Row {
  id: string
  [key: string]: string
}

export type FieldValues = Record<string, string>
export type BlockValue = FieldValues | Row[]
/** blockId (contract path) → value. "<blockId>:none" holds the "nothing to report" switch. */
export type StepData = Record<string, BlockValue>
export type AppraisalData = Record<string, StepData>

/** UI view model for the dashboard, composed in the services layer from contract endpoints. Not a wire type. */
export interface DashboardData {
  year: string
  status: AppraisalStatus
  /** UI hint computed from the form data; not an authoritative backend value */
  completion: number
  scoreSheet: ScoreSheetDto | null
  pendingSections: { stepId: string; title: string }[]
  documentCount: number
  activity: { id: string; text: string; at: string }[]
}
