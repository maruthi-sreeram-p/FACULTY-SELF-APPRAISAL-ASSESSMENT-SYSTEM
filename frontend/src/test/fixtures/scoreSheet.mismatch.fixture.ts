/**
 * ============================================================================================
 *  TEST FIXTURE. NOT DEMO DATA. NEVER IMPORTED BY THE APP, THE MOCK API OR ANY PAGE.
 * ============================================================================================
 *
 * An artificial backend score sheet whose criterion self-score does NOT equal the sum of its
 * component self-scores:
 *
 *      B1 components   7 + 6 + 5 + 3 + 4  = 25
 *      B1 criterion    self-score          = 24      <- deliberately different
 *
 * Purpose: prove that the frontend only DISPLAYS the values the backend returns and never derives a
 * criterion score from component scores. The college has not defined how scores are produced or
 * whether a criterion score is the sum of its components, so no such rule exists in the app.
 *
 * These numbers are invented for testing. They must never appear as production or mock demo data
 * (see noArtificialData.test.ts, which fails if this file is imported outside tests).
 */
import type { ScoreSheetDto } from '../../contract/dto'
import { COMPONENTS, CRITERIA, MAX_MARKS } from '../../data/scoring'

export const MISMATCH_COMPONENT_SELF_SCORES = [7, 6, 5, 3, 4] // B1, Assistant Professor; adds up to 25
export const MISMATCH_CRITERION_SELF_SCORE = 24 // deliberately NOT 25
export const MISMATCH_TOTAL_SELF_SCORE = 61

export const MISMATCH_SCORE_SHEET: ScoreSheetDto = {
  cadre: 'ASSISTANT_PROFESSOR',
  scoringTemplate: { code: 'TEST-FIXTURE', name: 'TEST FIXTURE (artificial)', version: 1 },
  maxScore: 100,
  selfScore: MISMATCH_TOTAL_SELF_SCORE,
  criteria: CRITERIA.map((c) => ({
    criterion: c.code,
    maxMarks: MAX_MARKS.ASSISTANT_PROFESSOR[c.code],
    selfScore: c.code === 'TEACHING_LEARNING' ? MISMATCH_CRITERION_SELF_SCORE : null,
    components: (COMPONENTS.ASSISTANT_PROFESSOR[c.code] ?? []).map((k, i) => ({
      componentNo: k.no,
      label: k.label,
      maxMarks: k.max,
      selfScore: c.code === 'TEACHING_LEARNING' ? MISMATCH_COMPONENT_SELF_SCORES[i] : null,
    })),
  })),
}
