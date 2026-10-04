import { STEPS, SUPPORTING_DOCS_BLOCK } from '../data/appraisalSchema'
import { SUPPORTING_DOCUMENTS } from '../data/supportingDocuments'
import { isNone, noneKey } from '../lib/completion'
import type { AppraisalData, BlockDef, FieldDef, FieldValues, Row } from '../types'
import type { AppraisalContentDto, AppraisalSectionKey } from './dto'

/**
 * Converts between the UI form state (every input a string, keyed step → block) and the wire shape
 * described in docs/backend/api-contract.md. Driven entirely by the schema: block `id` = contract path,
 * field `key` = contract property, select values = contract enum codes.
 *
 * Wire rules: '' → null · numbers are numbers · dates "YYYY-MM-DD" · month-year "YYYY-MM" ·
 * "Duration (From–To)" → `${key}From` / `${key}To`.
 */

const BLOCKS: { stepId: string; block: BlockDef }[] = STEPS.flatMap((step) =>
  (step.sections ?? []).flatMap((s) => s.blocks.map((block) => ({ stepId: step.id, block }))))

type Bag = Record<string, unknown>
const blank = (v: unknown) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '')

function setPath(obj: Bag, path: string, value: unknown) {
  const parts = path.split('.')
  let cur = obj
  for (const p of parts.slice(0, -1)) cur = (cur[p] ??= {}) as Bag
  cur[parts[parts.length - 1]] = value
}
function getPath(obj: Bag, path: string): unknown {
  return path.split('.').reduce<unknown>((cur, p) => (cur && typeof cur === 'object' ? (cur as Bag)[p] : undefined), obj)
}

function fieldToWire(f: FieldDef, v: FieldValues, out: Bag) {
  if (f.type === 'daterange') {
    for (const side of ['From', 'To']) out[`${f.key}${side}`] = blank(v[`${f.key}${side}`]) ? null : v[`${f.key}${side}`]
    return
  }
  const raw = v[f.key]
  if (f.type === 'number') out[f.key] = blank(raw) ? null : Number(raw)
  else if (f.type === 'checkbox') out[f.key] = raw === 'true'
  else out[f.key] = blank(raw) ? null : raw
}

function fieldFromWire(f: FieldDef, w: Bag, out: FieldValues) {
  const str = (x: unknown) => (blank(x) ? '' : String(x))
  if (f.type === 'daterange') {
    for (const side of ['From', 'To']) out[`${f.key}${side}`] = str(w[`${f.key}${side}`]).slice(0, 10)
    return
  }
  const raw = w[f.key]
  if (f.type === 'checkbox') out[f.key] = raw === true ? 'true' : ''
  else if (f.type === 'month') out[f.key] = str(raw).slice(0, 7)
  else if (f.type === 'date') out[f.key] = str(raw).slice(0, 10)
  else out[f.key] = str(raw)
}

/** Form state → full wire content (every section present, empty values as null / []). */
export function toContent(data: AppraisalData): AppraisalContentDto {
  const out: Bag = {}
  const none: string[] = []

  for (const { stepId, block } of BLOCKS) {
    const sd = data[stepId]
    if (isNone(sd, block.id)) none.push(block.id)

    if (block.kind === 'fields') {
      const v = (sd?.[block.id] as FieldValues | undefined) ?? {}
      const obj: Bag = {}
      block.fields.forEach((f) => fieldToWire(f, v, obj))
      setPath(out, block.id, obj)
    } else if (block.kind === 'table') {
      const rows = (sd?.[block.id] as Row[] | undefined) ?? []
      setPath(out, block.id, rows.map((r) => {
        const obj: Bag = { id: r.id }
        block.rowFields.forEach((f) => fieldToWire(f, r, obj))
        return obj
      }))
    } else {
      const v = (sd?.[block.id] as FieldValues | undefined) ?? {}
      const rows = block.rows.flatMap((r) => {
        const obj: Bag = { [block.rowKeyField]: r.key }
        let any = false
        for (const c of block.cols) {
          const raw = v[`${r.key}.${c.key}`]
          obj[c.key] = blank(raw) ? null : Number(raw)
          if (!blank(raw)) any = true
        }
        return any ? [obj] : []
      })
      setPath(out, block.id, rows)
    }
  }

  const docs = (data.scores?.[SUPPORTING_DOCS_BLOCK] as FieldValues | undefined) ?? {}
  out.supportingDocuments = {
    enclosed: SUPPORTING_DOCUMENTS.filter((d) => docs[d.code] === 'true').map((d) => d.code),
    othersSpecify: blank(docs.othersSpecify) ? null : docs.othersSpecify,
  }
  out.nothingToReport = none
  return out as unknown as AppraisalContentDto
}

/** Wire content → form state. Tolerates missing sections. */
export function fromContent(dto: Partial<AppraisalContentDto>): AppraisalData {
  const data: AppraisalData = {}
  const step = (id: string) => (data[id] ??= {})
  const src = dto as unknown as Bag

  for (const { stepId, block } of BLOCKS) {
    const w = getPath(src, block.id)
    if (block.kind === 'fields') {
      const vals: FieldValues = {}
      block.fields.forEach((f) => fieldFromWire(f, (w ?? {}) as Bag, vals))
      step(stepId)[block.id] = vals
    } else if (block.kind === 'table') {
      const list = Array.isArray(w) ? (w as Bag[]) : []
      step(stepId)[block.id] = list.map((r) => {
        const row: Row = { id: String(r.id ?? crypto.randomUUID()) }
        block.rowFields.forEach((f) => fieldFromWire(f, r, row))
        return row
      })
    } else {
      const vals: FieldValues = {}
      for (const r of (Array.isArray(w) ? (w as Bag[]) : [])) {
        const key = String(r[block.rowKeyField] ?? '')
        for (const c of block.cols) vals[`${key}.${c.key}`] = blank(r[c.key]) ? '' : String(r[c.key])
      }
      step(stepId)[block.id] = vals
    }
  }

  for (const p of dto.nothingToReport ?? []) {
    const hit = BLOCKS.find((b) => b.block.id === p)
    if (hit) step(hit.stepId)[noneKey(p)] = { none: 'true' }
  }

  const enclosed: FieldValues = {}
  for (const code of dto.supportingDocuments?.enclosed ?? []) enclosed[code] = 'true'
  if (dto.supportingDocuments?.othersSpecify) enclosed.othersSpecify = dto.supportingDocuments.othersSpecify
  step('scores')[SUPPORTING_DOCS_BLOCK] = enclosed

  return data
}

/** Which contract section a form-state key belongs to (for PATCH of changed sections only). */
export function sectionKeyOf(blockKey: string): AppraisalSectionKey {
  if (blockKey.endsWith(':none')) return 'nothingToReport'
  return blockKey.split('.')[0] as AppraisalSectionKey
}

export function pickSections(content: AppraisalContentDto, keys: Iterable<AppraisalSectionKey>): Partial<AppraisalContentDto> {
  const out: Partial<AppraisalContentDto> = {}
  for (const k of keys) (out as Bag)[k] = content[k]
  return out
}
