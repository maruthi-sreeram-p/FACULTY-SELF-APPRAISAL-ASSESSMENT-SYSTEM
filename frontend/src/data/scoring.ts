import type { CadreCode, CriterionCode } from '../contract/dto'

/**
 * Score sheet reference data taken from the college's Faculty Self-Appraisal & Assessment Report:
 * the nine scoring criteria and the cadre-wise MAXIMUM marks (Annexure A).
 *
 * IMPORTANT
 *  - The PDF defines maximum marks only. It does not define a formula that turns activities into a
 *    self-score, so the frontend never calculates scores. `selfScore` comes from the backend.
 *  - The backend is the source of truth for maxScore / selfScore. This file is the printed reference used for the
 *    Annexure A table and until the backend returns a score sheet.
 *  - "Any Other Contributions" has no scoring row in the PDF, so there is no 10th criterion.
 */

export const CRITERIA: readonly { code: CriterionCode; no: number; title: string; stepId: string }[] = [
  { code: 'TEACHING_LEARNING', no: 1, title: 'Teaching & Learning', stepId: 'teaching' },
  { code: 'STUDENT_MENTORING', no: 2, title: 'Student Mentoring, Guidance & Achievements', stepId: 'mentoring' },
  { code: 'FDP_CERTIFICATIONS', no: 3, title: 'FDPs / Certifications', stepId: 'fdp' },
  { code: 'ADMINISTRATIVE', no: 4, title: 'Administrative, Curriculum & Quality Contributions', stepId: 'admin' },
  { code: 'RESEARCH_PUBLICATIONS', no: 5, title: 'Research & Publications', stepId: 'research' },
  { code: 'FUNDED_PROJECTS', no: 6, title: 'Funded Projects / Consultancy', stepId: 'projects' },
  { code: 'PATENTS_BOOKS_IPR', no: 7, title: 'Patents, Books & IPR', stepId: 'ipr' },
  { code: 'OUTREACH', no: 8, title: 'Outreach', stepId: 'outreach' },
  { code: 'MEMBERSHIPS_AWARDS', no: 9, title: 'Professional Memberships, Awards & Recognitions', stepId: 'memberships' },
]

/** The five cadres of Part A "Designation (Cadre)". `short` is the Annexure A column heading. */
export const CADRES: readonly { code: CadreCode; label: string; short: string }[] = [
  { code: 'LECTURER', label: 'Lecturer', short: 'Lecturer' },
  { code: 'ASSISTANT_PROFESSOR', label: 'Assistant Professor', short: 'Asst. Prof.' },
  { code: 'SENIOR_ASSISTANT_PROFESSOR', label: 'Senior Assistant Professor', short: 'Sr. Asst. Prof.' },
  { code: 'ASSOCIATE_PROFESSOR', label: 'Associate Professor', short: 'Assoc. Prof.' },
  { code: 'PROFESSOR', label: 'Professor', short: 'Professor' },
]

/** Maximum marks per criterion, by cadre (Annexure A). Every cadre totals 100. */
export const MAX_MARKS: Record<CadreCode, Record<CriterionCode, number>> = {
  LECTURER:                   { TEACHING_LEARNING: 40, STUDENT_MENTORING: 15, FDP_CERTIFICATIONS: 15, ADMINISTRATIVE: 15, RESEARCH_PUBLICATIONS: 5,  FUNDED_PROJECTS: 0,  PATENTS_BOOKS_IPR: 0, OUTREACH: 5, MEMBERSHIPS_AWARDS: 5 },
  ASSISTANT_PROFESSOR:        { TEACHING_LEARNING: 30, STUDENT_MENTORING: 12, FDP_CERTIFICATIONS: 10, ADMINISTRATIVE: 15, RESEARCH_PUBLICATIONS: 15, FUNDED_PROJECTS: 5,  PATENTS_BOOKS_IPR: 3, OUTREACH: 5, MEMBERSHIPS_AWARDS: 5 },
  SENIOR_ASSISTANT_PROFESSOR: { TEACHING_LEARNING: 25, STUDENT_MENTORING: 10, FDP_CERTIFICATIONS: 8,  ADMINISTRATIVE: 15, RESEARCH_PUBLICATIONS: 20, FUNDED_PROJECTS: 7,  PATENTS_BOOKS_IPR: 5, OUTREACH: 5, MEMBERSHIPS_AWARDS: 5 },
  ASSOCIATE_PROFESSOR:        { TEACHING_LEARNING: 20, STUDENT_MENTORING: 8,  FDP_CERTIFICATIONS: 5,  ADMINISTRATIVE: 15, RESEARCH_PUBLICATIONS: 25, FUNDED_PROJECTS: 10, PATENTS_BOOKS_IPR: 7, OUTREACH: 5, MEMBERSHIPS_AWARDS: 5 },
  PROFESSOR:                  { TEACHING_LEARNING: 15, STUDENT_MENTORING: 5,  FDP_CERTIFICATIONS: 5,  ADMINISTRATIVE: 20, RESEARCH_PUBLICATIONS: 25, FUNDED_PROJECTS: 12, PATENTS_BOOKS_IPR: 8, OUTREACH: 5, MEMBERSHIPS_AWARDS: 5 },
}

export const isCadreCode = (v?: string | null): v is CadreCode => CADRES.some((c) => c.code === v)

export const cadreLabel = (code?: string | null) => CADRES.find((c) => c.code === code)?.label ?? ''

/** Sum of the configured maximum marks (not a score). */
export const totalMax = (cadre: CadreCode) => CRITERIA.reduce((sum, c) => sum + MAX_MARKS[cadre][c.code], 0)
