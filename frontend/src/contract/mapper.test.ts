import { describe, expect, it } from 'vitest'
import { STEPS, SUPPORTING_DOCS_BLOCK } from '../data/appraisalSchema'
import type { AppraisalData, FieldDef, FieldValues } from '../types'
import { fromContent, toContent } from './mapper'

const optionValue = (o: string | { value: string }) => (typeof o === 'string' ? o : o.value)
const sample = (f: FieldDef, i: number): string =>
  ({ text: `t${i}`, textarea: `long ${i}`, number: String(i + 1), date: '2025-08-14', month: '2025-03', daterange: '', checkbox: 'true',
     select: f.options?.length ? optionValue(f.options[0]) : '', combobox: f.options?.length ? optionValue(f.options[0]) : 'x' })[f.type]

function fill(fields: FieldDef[]): FieldValues {
  const v: FieldValues = {}
  fields.forEach((f, i) => {
    if (f.type === 'daterange') { v[`${f.key}From`] = '2025-06-02'; v[`${f.key}To`] = '2025-06-06' } else v[f.key] = sample(f, i)
  })
  return v
}

function fullyPopulated(): AppraisalData {
  const data: AppraisalData = {}
  for (const step of STEPS) for (const section of step.sections ?? []) for (const b of section.blocks) {
    const sd = (data[step.id] ??= {})
    if (b.kind === 'fields') sd[b.id] = fill(b.fields)
    else if (b.kind === 'table') sd[b.id] = [{ id: crypto.randomUUID(), ...fill(b.rowFields) }, { id: crypto.randomUUID(), ...fill(b.rowFields) }]
    else sd[b.id] = Object.fromEntries(b.rows.flatMap((r, ri) => b.cols.map((c, ci) => [`${r.key}.${c.key}`, String(ri * 10 + ci + 1)])))
  }
  data.scores = { [SUPPORTING_DOCS_BLOCK]: { COURSE_FILES_RESULT_ANALYSIS: 'true', OTHERS: 'true', othersSpecify: 'brochure' } }
  data.teaching['teaching.summary:none'] = { none: 'true' }
  return data
}

describe('contract mapper', () => {
  it('round-trips a fully populated form without loss', () => {
    const content = toContent(fullyPopulated())
    expect(toContent(fromContent(content))).toEqual(content)
  })

  it('emits exactly the contract sections, with typed values and null for empty', () => {
    const c = toContent({}) as unknown as Record<string, unknown>
    expect(Object.keys(c).sort()).toEqual([
      'administrative', 'declaration', 'fdp', 'fundedProjects', 'generalInfo', 'ipr', 'membershipsAwards', 'mentoring',
      'nothingToReport', 'otherContributions', 'outreach', 'research', 'supportingDocuments', 'teaching',
    ])
    const full = toContent(fullyPopulated())
    expect(typeof full.teaching.entries[0].numSections).toBe('number')
    expect(typeof full.teaching.entries[0].passPercent).toBe('number')
    expect(full.fdp.programs[0].durationFrom).toBe('2025-06-02')
    expect(full.research.metrics).toHaveLength(3)
    expect(full.nothingToReport).toEqual(['teaching.summary'])
  })

  it('never carries backend-owned data: no scores and no reviews are ever written by the form', () => {
    const c = toContent(fullyPopulated()) as unknown as Record<string, unknown>
    expect(c).not.toHaveProperty('scoreSheet')
    expect(c).not.toHaveProperty('reviews')
    expect(JSON.stringify(c)).not.toMatch(/selfScore/)
  })
})
