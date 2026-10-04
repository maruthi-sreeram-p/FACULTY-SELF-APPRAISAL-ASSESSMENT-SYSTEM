import type {
  AppraisalData, BlockDef, FieldDef, FieldValues, MatrixBlockDef, Row, StepData, StepDef, TableBlockDef,
} from '../types'

/**
 * UI-only completeness and input hints. NOT scoring.
 * Scores come exclusively from the backend. Which blocks are mandatory is a
 * PROVISIONAL UI rule (the PDF does not define one); see docs/ui/pdf-audit.md.
 */
export type StepState = 'empty' | 'partial' | 'complete' | 'error'
export type BlockState = StepState | 'na'

export const noneKey = (blockId: string) => `${blockId}:none`
export const isNone = (data: StepData | undefined, blockId: string) =>
  (data?.[noneKey(blockId)] as FieldValues | undefined)?.none === 'true'

const filled = (v?: string) => !!v && v.trim() !== ''

/** Keys a field occupies in its values object ("Duration (From–To)" uses two). */
export const fieldKeys = (f: FieldDef) => (f.type === 'daterange' ? [`${f.key}From`, `${f.key}To`] : [f.key])

const hasValue = (f: FieldDef, v: FieldValues) => fieldKeys(f).some((k) => filled(v[k]))

/** Required-field problems only. */
export function requiredErrors(fields: FieldDef[], v: FieldValues): Record<string, string> {
  const out: Record<string, string> = {}
  for (const f of fields) {
    if (f.required && !(f.type === 'checkbox' ? v[f.key] === 'true' : hasValue(f, v))) out[f.key] = `${f.label} is required`
  }
  return out
}

/** Input sanity problems (ranges, date order). Not institutional rules. */
export function sanityErrors(fields: FieldDef[], v: FieldValues): Record<string, string> {
  const out: Record<string, string> = {}
  for (const f of fields) {
    if (f.type === 'number' && filled(v[f.key])) {
      const n = Number(v[f.key])
      if (Number.isNaN(n)) out[f.key] = `${f.label} must be a number`
      else if (f.min !== undefined && n < f.min) out[f.key] = `${f.label} cannot be below ${f.min}`
      else if (f.max !== undefined && n > f.max) out[f.key] = `${f.label} cannot be above ${f.max}`
    }
    if (f.type === 'daterange') {
      const [a, b] = [v[`${f.key}From`], v[`${f.key}To`]]
      if (filled(a) && filled(b) && b < a) out[f.key] = 'The end date is before the start date'
    }
  }
  return out
}

export const fieldsErrors = (fields: FieldDef[], v: FieldValues) => ({ ...sanityErrors(fields, v), ...requiredErrors(fields, v) })

function tableState(b: TableBlockDef, d: StepData | undefined): BlockState {
  const rows = (d?.[b.id] as Row[] | undefined) ?? []
  if (rows.length === 0) return isNone(d, b.id) ? 'na' : 'empty'
  return rows.every((r) => Object.keys(fieldsErrors(b.rowFields, r)).length === 0) ? 'complete' : 'error'
}

function matrixState(b: MatrixBlockDef, d: StepData | undefined): BlockState {
  const v = (d?.[b.id] as FieldValues | undefined) ?? {}
  const any = Object.values(v).some(filled)
  const bad = b.rows.some((r) => b.cols.some((c) => {
    const x = v[`${r.key}.${c.key}`]
    return filled(x) && (Number.isNaN(Number(x)) || Number(x) < 0)
  }))
  if (bad) return 'error'
  if (any) return 'complete'
  return isNone(d, b.id) ? 'na' : 'empty'
}

export function blockState(b: BlockDef, d: StepData | undefined): BlockState {
  if (b.kind === 'table') return tableState(b, d)
  if (b.kind === 'matrix') return matrixState(b, d)
  const v = (d?.[b.id] as FieldValues | undefined) ?? {}
  const any = b.fields.some((f) => hasValue(f, v))
  if (Object.keys(sanityErrors(b.fields, v)).length) return 'error'
  if (!any) return isNone(d, b.id) || b.optional ? 'na' : 'empty'
  return Object.keys(requiredErrors(b.fields, v)).length ? 'partial' : 'complete'
}

function aggregate(states: BlockState[]): StepState {
  if (states.includes('error')) return 'error'
  if (states.every((s) => s === 'complete' || s === 'na')) return 'complete'
  if (states.every((s) => s === 'empty')) return 'empty'
  return 'partial'
}

export function stepState(step: StepDef, data: AppraisalData): StepState {
  if (step.kind !== 'sections') return 'empty'
  const d = data[step.id]
  return aggregate((step.sections ?? []).flatMap((s) => s.blocks.map((b) => blockState(b, d))))
}

export function sectionState(step: StepDef, sectionId: string, data: AppraisalData): StepState {
  const section = step.sections?.find((s) => s.id === sectionId)
  return aggregate((section?.blocks ?? []).map((b) => blockState(b, data[step.id])))
}

/** Steps that contribute to the completion figure (data-entry steps). */
export const COMPLETABLE = (s: StepDef) => s.kind === 'sections'

export function completionPercent(steps: StepDef[], data: AppraisalData) {
  const list = steps.filter(COMPLETABLE)
  const done = list.filter((s) => stepState(s, data) === 'complete').length
  return Math.round((done / list.length) * 100)
}

export interface Issue { stepId: string; sectionId: string; blockId: string; message: string }

/**
 * PROVISIONAL submission gate (UI only): invalid entries, and mandatory blocks
 * (General Information, Declaration) not complete. Empty optional sections do not
 * block; they are listed as "not addressed" instead. The backend remains authoritative.
 */
export function blockingIssues(steps: StepDef[], data: AppraisalData): Issue[] {
  const out: Issue[] = []
  for (const step of steps.filter(COMPLETABLE)) {
    for (const section of step.sections ?? []) {
      for (const b of section.blocks) {
        const st = blockState(b, data[step.id])
        const label = b.title ?? section.title
        if (st === 'error') out.push({ stepId: step.id, sectionId: section.id, blockId: b.id, message: `Fix the entries in “${label}”` })
        else if (b.mandatory && st !== 'complete') out.push({ stepId: step.id, sectionId: section.id, blockId: b.id, message: `Complete “${label}”` })
      }
    }
  }
  return out
}

/** Data-entry steps with nothing recorded and no "nothing to report" answer (soft warning only). */
export const notAddressed = (steps: StepDef[], data: AppraisalData) =>
  steps.filter(COMPLETABLE).filter((s) => {
    const st = stepState(s, data)
    return st === 'empty' || st === 'partial'
  })
