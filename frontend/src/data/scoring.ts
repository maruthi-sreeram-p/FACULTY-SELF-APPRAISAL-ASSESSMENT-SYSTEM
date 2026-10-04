/**
 * Score sheet configuration taken from the college's Faculty Self-Appraisal &
 * Assessment Report: the nine scoring criteria and the cadre-wise MAXIMUM marks.
 *
 * IMPORTANT
 *  - The PDF defines maximum marks only. It does not define a formula that turns
 *    activities into a self-score, so the frontend never calculates scores.
 *    `selfScore` values come from the backend and are only displayed.
 *  - "Any Other Contributions" has no scoring row in the PDF, so there is no 10th criterion.
 */

export const CRITERIA = [
  { id: 'teaching', no: 1, title: 'Teaching & Learning', stepId: 'teaching' },
  { id: 'mentoring', no: 2, title: 'Student Mentoring, Guidance & Achievements', stepId: 'mentoring' },
  { id: 'fdp', no: 3, title: 'FDPs / Certifications', stepId: 'fdp' },
  { id: 'admin', no: 4, title: 'Administrative, Curriculum & Quality Contributions', stepId: 'admin' },
  { id: 'research', no: 5, title: 'Research & Publications', stepId: 'research' },
  { id: 'projects', no: 6, title: 'Funded Projects / Consultancy', stepId: 'projects' },
  { id: 'ipr', no: 7, title: 'Patents, Books & IPR', stepId: 'ipr' },
  { id: 'outreach', no: 8, title: 'Outreach', stepId: 'outreach' },
  { id: 'memberships', no: 9, title: 'Professional Memberships, Awards & Recognitions', stepId: 'memberships' },
] as const

export type CriterionId = (typeof CRITERIA)[number]['id']

export const CADRES = [
  'Lecturer',
  'Assistant Professor',
  'Senior Assistant Professor',
  'Associate Professor',
  'Professor',
] as const

export type Cadre = (typeof CADRES)[number]

/** Maximum marks per criterion, by cadre. Order follows CRITERIA. Every cadre totals 100. */
export const MAX_MARKS: Record<Cadre, Record<CriterionId, number>> = {
  'Lecturer':                   { teaching: 40, mentoring: 15, fdp: 15, admin: 15, research: 5,  projects: 0,  ipr: 0, outreach: 5, memberships: 5 },
  'Assistant Professor':        { teaching: 30, mentoring: 12, fdp: 10, admin: 15, research: 15, projects: 5,  ipr: 3, outreach: 5, memberships: 5 },
  'Senior Assistant Professor': { teaching: 25, mentoring: 10, fdp: 8,  admin: 15, research: 20, projects: 7,  ipr: 5, outreach: 5, memberships: 5 },
  'Associate Professor':        { teaching: 20, mentoring: 8,  fdp: 5,  admin: 15, research: 25, projects: 10, ipr: 7, outreach: 5, memberships: 5 },
  'Professor':                  { teaching: 15, mentoring: 5,  fdp: 5,  admin: 20, research: 25, projects: 12, ipr: 8, outreach: 5, memberships: 5 },
}

/** Match a free-text cadre/designation to one of the PDF's cadres (case-insensitive, exact). */
export function normalizeCadre(value?: string | null): Cadre | null {
  const v = value?.trim().toLowerCase()
  return CADRES.find((c) => c.toLowerCase() === v) ?? null
}

/** Sum of the configured maximum marks (not a score). */
export const totalMax = (cadre: Cadre) =>
  CRITERIA.reduce((sum, c) => sum + MAX_MARKS[cadre][c.id], 0)
