import { describe, expect, it } from 'vitest'
import { CADRES, COMPONENTS, COMPONENT_CRITERIA, CRITERIA, MAX_MARKS, componentsFor, totalMax } from './scoring'

describe('scoring reference data', () => {
  it('has exactly nine criteria and no tenth for "Any Other Contributions"', () => {
    expect(CRITERIA).toHaveLength(9)
    expect(CRITERIA.map((c) => c.no)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('totals 100 for every cadre (Annexure A)', () => {
    for (const k of CADRES) expect(totalMax(k.code)).toBe(100)
  })

  it('splits B1 to B5 into components that add up to the criterion maximum, for every cadre', () => {
    let pairs = 0
    for (const k of CADRES) {
      for (const code of COMPONENT_CRITERIA) {
        const comps = COMPONENTS[k.code][code] ?? []
        expect(comps.length, `${k.code} ${code}`).toBeGreaterThan(0)
        expect(comps.reduce((s, c) => s + c.max, 0), `${k.code} ${code}`).toBe(MAX_MARKS[k.code][code])
        pairs++
      }
    }
    expect(pairs).toBe(25)
  })

  it('has 102 components: Lecturer 19, Assistant 21, Senior Assistant 21, Associate 21, Professor 20', () => {
    const n = (code: (typeof CADRES)[number]['code']) => COMPONENT_CRITERIA.reduce((s, c) => s + (COMPONENTS[code][c]?.length ?? 0), 0)
    expect(CADRES.map((k) => n(k.code))).toEqual([19, 21, 21, 21, 20])
  })

  it('defines NO components for B6 to B9, so they stay criterion-level only', () => {
    const criterionOnly = CRITERIA.filter((c) => !COMPONENT_CRITERIA.includes(c.code)).map((c) => c.code)
    expect(criterionOnly).toEqual(['FUNDED_PROJECTS', 'PATENTS_BOOKS_IPR', 'OUTREACH', 'MEMBERSHIPS_AWARDS'])
    for (const k of CADRES) for (const code of criterionOnly) expect(componentsFor(k.code, code)).toEqual([])
    // their criterion maxima are still defined (Annexure A)
    expect(MAX_MARKS.ASSISTANT_PROFESSOR.FUNDED_PROJECTS).toBe(5)
    expect(MAX_MARKS.LECTURER.PATENTS_BOOKS_IPR).toBe(0)
  })

  it('keeps cadre-specific component sets: number and wording differ between cadres', () => {
    expect(COMPONENTS.LECTURER.RESEARCH_PUBLICATIONS).toHaveLength(3)
    expect(COMPONENTS.ASSISTANT_PROFESSOR.RESEARCH_PUBLICATIONS).toHaveLength(5)
    expect(COMPONENTS.PROFESSOR.STUDENT_MENTORING).toHaveLength(3)
    expect(COMPONENTS.LECTURER.STUDENT_MENTORING).toHaveLength(4)
    expect(COMPONENTS.LECTURER.TEACHING_LEARNING?.[2].label).toBe('Student feedback')
    expect(COMPONENTS.ASSISTANT_PROFESSOR.TEACHING_LEARNING?.[2].label).toBe('Feedback')
  })

  it('numbers components 1..n within each cadre and criterion', () => {
    for (const k of CADRES) for (const code of COMPONENT_CRITERIA) {
      const comps = COMPONENTS[k.code][code] ?? []
      expect(comps.map((c) => c.no)).toEqual(comps.map((_, i) => i + 1))
      for (const c of comps) expect(c.label.trim()).not.toBe('')
    }
  })

  it('returns no components when the cadre is unknown', () => {
    expect(componentsFor(null, 'TEACHING_LEARNING')).toEqual([])
    expect(componentsFor(undefined, 'TEACHING_LEARNING')).toEqual([])
  })
})
