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

/* -------------------------------------------------------------------------------------------------
 * Scoring components, criteria B1 to B5 (source: "Scoring criteria B1 to B5 (Annexure A & B)").
 *
 * CONFIRMED FROM SOURCE DOCUMENT: for each cadre, B1-B5 are broken into components with a maximum
 * mark each. Labels are verbatim. Per cadre and criterion the components sum to the criterion maximum above.
 *
 * REQUIRES COLLEGE CONFIRMATION (nothing below defines it, so nothing in this app calculates, enforces or assumes it):
 *  - how component self-scores are calculated (pass %, feedback, publication counts, FDP counts, thresholds ...);
 *  - whether component self-scores are required;
 *  - whether a criterion self-score equals the sum of its component self-scores. Criterion maximum, component
 *    maximum, criterion self-score and component self-score are four SEPARATE values; the app never sums them;
 *  - who enters self-scores, whether panel scores use the same breakdown, and the scoring granularity;
 *  - components for B6-B9 (Funded Projects, Patents/Books/IPR, Outreach, Memberships/Awards): none are defined,
 *    only their criterion maximum, so they stay criterion-level only.
 *
 * Components differ in wording and number between cadres, so their identity is the position `no` within a
 * (cadre, criterion) list. Do not assume that component 3 of one cadre equals component 3 of another.
 * ---------------------------------------------------------------------------------------------- */

export interface ScoringComponent { no: number; label: string; max: number }

/** B1-B5 map to these criteria; B6-B9 have no component breakdown. */
export const COMPONENT_CRITERIA: readonly CriterionCode[] = [
  'TEACHING_LEARNING', 'STUDENT_MENTORING', 'FDP_CERTIFICATIONS', 'ADMINISTRATIVE', 'RESEARCH_PUBLICATIONS',
]

const list = (...pairs: [string, number][]): readonly ScoringComponent[] => pairs.map(([label, max], i) => ({ no: i + 1, label, max }))

export const COMPONENTS: Record<CadreCode, Partial<Record<CriterionCode, readonly ScoringComponent[]>>> = {
  LECTURER: {
    TEACHING_LEARNING: list(['Workload & course delivery', 10], ['Pass/result performance', 10], ['Student feedback', 8], ['Course-file/assessment quality', 6], ['Innovative/remedial/advanced-learning practices', 6]),
    STUDENT_MENTORING: list(['Mentoring records & attendance/academic follow-up', 5], ['Project/lab guidance', 4], ['Student achievement support', 4], ['Parent/student support evidence', 2]),
    FDP_CERTIFICATIONS: list(['FDP/workshops/training', 10], ['Relevant certification', 5]),
    ADMINISTRATIVE: list(['Department responsibilities', 5], ['Institute committees/events', 3], ['Curriculum/BoS/academic support', 3], ['Quality/accreditation contributions', 2], ['Measurable institutional/student-service contribution', 2]),
    RESEARCH_PUBLICATIONS: list(['Quality publications', 3], ['Citations/research profile', 1], ['Research activity/collaboration', 1]),
  },
  ASSISTANT_PROFESSOR: {
    TEACHING_LEARNING: list(['Workload & course delivery', 8], ['Pass/result performance', 8], ['Feedback', 6], ['Course-file/assessment quality', 4], ['Innovation/remedial/advanced learning', 4]),
    STUDENT_MENTORING: list(['Mentoring', 4], ['Project guidance', 3], ['Student achievements', 3], ['Academic/placement/competitive-exam support', 2]),
    FDP_CERTIFICATIONS: list(['FDP/workshops/training', 6], ['Relevant certification', 4]),
    ADMINISTRATIVE: list(['Department responsibilities', 4], ['Institute roles', 3], ['Curriculum/BoS', 3], ['Quality/accreditation', 3], ['Measurable institutional contribution', 2]),
    RESEARCH_PUBLICATIONS: list(['SCI/SCIE/quality Scopus publications', 8], ['Other eligible publications', 2], ['Citations/profile', 2], ['Conference/research dissemination', 1], ['Research collaboration/academic output', 2]),
  },
  SENIOR_ASSISTANT_PROFESSOR: {
    TEACHING_LEARNING: list(['Workload & course delivery', 6], ['Result performance', 6], ['Feedback', 5], ['Course/assessment quality', 4], ['Innovation/academic contribution', 4]),
    STUDENT_MENTORING: list(['Mentoring quality', 3], ['Project guidance', 3], ['Student achievements', 2], ['Academic/placement support', 2]),
    FDP_CERTIFICATIONS: list(['FDP/workshops/training', 5], ['Certification', 3]),
    ADMINISTRATIVE: list(['Department/institute responsibility', 4], ['Curriculum/BoS', 3], ['Quality/accreditation', 4], ['Committee/event leadership', 2], ['Institutional improvement', 2]),
    RESEARCH_PUBLICATIONS: list(['SCI/SCIE/quality Scopus publications', 10], ['Citations/profile', 3], ['Conference/research dissemination', 2], ['Research collaboration', 2], ['Ph.D./PG research guidance', 3]),
  },
  ASSOCIATE_PROFESSOR: {
    TEACHING_LEARNING: list(['Course delivery/workload', 5], ['Result/academic quality', 5], ['Feedback', 4], ['Course/assessment development', 3], ['Innovative teaching/academic leadership', 3]),
    STUDENT_MENTORING: list(['Mentoring', 2], ['Project/PG guidance', 2], ['Student achievements', 2], ['Advanced learner/placement/research support', 2]),
    FDP_CERTIFICATIONS: list(['FDP/workshops/training', 3], ['Certification', 2]),
    ADMINISTRATIVE: list(['Academic/administrative leadership', 4], ['Curriculum/BoS', 3], ['Quality/accreditation', 4], ['Committee/institutional leadership', 2], ['Measurable improvement', 2]),
    RESEARCH_PUBLICATIONS: list(['Quality journal publications', 12], ['Citations/research impact', 4], ['Research guidance', 4], ['Conference/research dissemination', 2], ['Collaboration/research leadership', 3]),
  },
  PROFESSOR: {
    TEACHING_LEARNING: list(['Teaching quality/workload', 4], ['Result/academic quality', 4], ['Feedback', 3], ['Curriculum/assessment contribution', 2], ['Innovative teaching/academic leadership', 2]),
    STUDENT_MENTORING: list(['Academic/research mentoring', 2], ['Student/project/PG guidance', 1], ['Significant student achievements', 2]),
    FDP_CERTIFICATIONS: list(['Relevant advanced FDP/training', 3], ['Certification/academic updating', 2]),
    ADMINISTRATIVE: list(['Academic/institutional leadership', 5], ['Curriculum/BoS', 4], ['Quality/accreditation', 5], ['Major institutional responsibility', 3], ['Measurable institutional development', 3]),
    RESEARCH_PUBLICATIONS: list(['Quality journal publications', 10], ['Citations/research impact', 5], ['Ph.D./PG guidance', 5], ['Research leadership/collaboration', 3], ['Conference/editorial/reviewer contributions', 2]),
  },
}

/** Printed components for a cadre and criterion; empty for B6-B9 (no breakdown defined). */
export const componentsFor = (cadre: CadreCode | null | undefined, criterion: CriterionCode): readonly ScoringComponent[] =>
  (cadre && COMPONENTS[cadre][criterion]) || []
