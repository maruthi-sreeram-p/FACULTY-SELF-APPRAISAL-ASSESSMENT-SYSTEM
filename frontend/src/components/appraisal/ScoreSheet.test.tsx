import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { CadreCode, ScoreSheetDto } from '../../contract/dto'
import { COMPONENT_CRITERIA, CRITERIA } from '../../data/scoring'
import {
  MISMATCH_COMPONENT_SELF_SCORES, MISMATCH_CRITERION_SELF_SCORE, MISMATCH_SCORE_SHEET, MISMATCH_TOTAL_SELF_SCORE,
} from '../../test/fixtures/scoreSheet.mismatch.fixture'
import { ScoreSheet } from './ScoreSheet'

afterEach(cleanup)

const renderSheet = (scoreSheet: ScoreSheetDto | null, cadre: CadreCode | null = 'ASSISTANT_PROFESSOR') =>
  render(<MemoryRouter><ScoreSheet scoreSheet={scoreSheet} cadre={cadre} year="2025-26" /></MemoryRouter>)

const mainTable = () => screen.getAllByRole('table')[0]
const rowOf = (title: string) => within(mainTable()).getByRole('link', { name: title }).closest('tr') as HTMLTableRowElement
const cells = (tr: HTMLTableRowElement) => Array.from(tr.querySelectorAll('td')).map((td) => td.textContent?.replace(/\s+/g, ' ').trim() ?? '')
const expandAll = () => fireEvent.click(screen.getByRole('button', { name: /show component breakdown/i }))

describe('ScoreSheet never derives a score', () => {
  it('shows the backend criterion self-score and total exactly as supplied, even when they disagree with the components', () => {
    // Fixture: B1 components add up to 25, but the backend says the criterion self-score is 24.
    expect(MISMATCH_COMPONENT_SELF_SCORES.reduce((a, b) => a + b, 0)).toBe(25)
    expect(MISMATCH_CRITERION_SELF_SCORE).toBe(24)

    renderSheet(MISMATCH_SCORE_SHEET)
    expandAll()

    const b1 = cells(rowOf('Teaching & Learning'))
    expect(b1).toContain(String(MISMATCH_CRITERION_SELF_SCORE)) // 24, as supplied
    expect(b1).not.toContain('25') // the sum of components is never shown as the criterion score

    // component self-scores are displayed individually
    const body = within(mainTable()).getAllByRole('rowgroup')[1] // first criterion group
    const componentCells = Array.from(body.querySelectorAll('tr:not(:first-child)')).map((tr) => cells(tr as HTMLTableRowElement).at(-1)!.replace(/^Self-score /, ''))
    expect(componentCells).toEqual(MISMATCH_COMPONENT_SELF_SCORES.map(String))

    // the total row is the backend's total, not a sum of anything
    const totalRow = within(mainTable()).getByText('Total').closest('tr') as HTMLTableRowElement
    expect(cells(totalRow)).toContain(String(MISMATCH_TOTAL_SELF_SCORE))

    // no cell anywhere in the table shows 25 as a self-score
    const everyCell = Array.from(mainTable().querySelectorAll('td')).map((td) => td.textContent?.replace(/\s+/g, ' ').trim())
    expect(everyCell).not.toContain('25')
  })

  it('shows dashes for every self-score and the printed maxima when no score sheet exists', () => {
    renderSheet(null)
    for (const c of CRITERIA) {
      const c4 = cells(rowOf(c.title))
      expect(c4.at(-1)).toBe('—') // self-score
    }
    expect(cells(rowOf('Teaching & Learning'))).toContain('30') // Assistant Professor maximum
    expect(cells(within(mainTable()).getByText('Total').closest('tr') as HTMLTableRowElement)).toEqual(['', 'Total', '100', '—'])
  })
})

describe('component breakdown', () => {
  it('is offered for B1 to B5 only; B6 to B9 are criterion-level and say no breakdown is defined', () => {
    renderSheet(null)
    const toggles = within(mainTable()).getAllByRole('button', { name: /components of/i })
    expect(toggles).toHaveLength(COMPONENT_CRITERIA.length) // 5

    const noBreakdown = CRITERIA.filter((c) => !COMPONENT_CRITERIA.includes(c.code))
    expect(noBreakdown.map((c) => c.no)).toEqual([6, 7, 8, 9])
    for (const c of noBreakdown) {
      const row = rowOf(c.title)
      expect(within(row).queryByRole('button')).toBeNull()
      expect(row.textContent).toMatch(/No component breakdown is defined/i)
    }
  })

  it('lists each component with its maximum and a dash for the self-score', () => {
    renderSheet(null)
    expandAll()
    const body = within(mainTable()).getAllByRole('rowgroup')[1]
    const rows = Array.from(body.querySelectorAll('tr:not(:first-child)')).map((tr) => cells(tr as HTMLTableRowElement))
    expect(rows).toHaveLength(5)
    // cells: [spacer, component, maximum, self-score]
    expect(rows[0][1]).toContain('Workload & course delivery')
    expect(rows[0][2]).toContain('8') // Assistant Professor B1 component 1
    expect(rows[0][3]).toContain('—')
  })

  it('says the methodology is not defined by the college, only while the breakdown is open', () => {
    renderSheet(null)
    expect(screen.queryByRole('note')).toBeNull()
    expandAll()
    const note = screen.getByRole('note')
    expect(note.textContent).toMatch(/not yet defined/i)
    expect(note.textContent).toMatch(/not calculated from its components/i)
  })

  it('follows the cadre: Lecturer B5 has 3 components, Professor B5 has 5 and Professor B2 has 3', () => {
    const count = (cadre: CadreCode, title: string) => {
      cleanup()
      renderSheet(null, cadre)
      expandAll()
      const group = rowOf(title).closest('tbody') as HTMLTableSectionElement
      return group.querySelectorAll('tr').length - 1
    }
    expect(count('LECTURER', 'Research & Publications')).toBe(3)
    expect(count('PROFESSOR', 'Research & Publications')).toBe(5)
    expect(count('PROFESSOR', 'Student Mentoring, Guidance & Achievements')).toBe(3)
    expect(count('LECTURER', 'Student Mentoring, Guidance & Achievements')).toBe(4)
  })

  it('shows no component rows and no maxima when the cadre is unknown', () => {
    renderSheet(null, null)
    expect(screen.queryByRole('button', { name: /show component breakdown/i })).toBeNull()
    expect(cells(rowOf('Teaching & Learning')).slice(-2)).toEqual(['—', '—'])
  })
})
