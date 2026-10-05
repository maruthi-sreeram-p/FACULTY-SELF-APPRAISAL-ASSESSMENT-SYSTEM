import { beforeEach, describe, expect, it } from 'vitest'
import { services } from '../lib/api'

/**
 * Guards for the rule "test data must not look like production or demo data" and for the
 * rule "the frontend infers no scoring". See scoreSheet.mismatch.fixture.ts.
 */

const sources = import.meta.glob('/src/**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const appSources = Object.entries(sources).filter(([path]) => !/\.test\.(ts|tsx)$/.test(path) && !path.includes('/src/test/'))

describe('no artificial data outside tests', () => {
  it('does not import the test fixtures from any app, mock or page code', () => {
    const leaks = appSources.filter(([, src]) => /test\/fixtures|MISMATCH_SCORE_SHEET|TEST-FIXTURE|TEST FIXTURE/.test(src)).map(([p]) => p)
    expect(leaks).toEqual([])
  })

  it('the fixture exists and is clearly labelled as a test fixture', () => {
    const fixture = Object.entries(sources).find(([p]) => p.endsWith('scoreSheet.mismatch.fixture.ts'))?.[1] ?? ''
    expect(fixture).toMatch(/TEST FIXTURE\. NOT DEMO DATA/)
    expect(fixture).toMatch(/NEVER IMPORTED BY THE APP/)
  })

  describe('mock API', () => {
    beforeEach(() => localStorage.clear())

    it('returns no score sheet and no reviews for a new appraisal (nothing is invented)', async () => {
      const a = await services.ensureAppraisal('2025-26')
      expect(a.scoreSheet).toBeNull()
      expect(a.reviews).toEqual({ hod: null, principal: null })
      await expect(services.dashboard('2025-26')).resolves.toMatchObject({ scoreSheet: null })
    })
  })
})

describe('the frontend infers no scoring', () => {
  it('has no arithmetic over self-scores in app code', () => {
    // Heuristic guard: self-score values may be displayed or compared, never added, reduced or averaged.
    const offenders = appSources.flatMap(([path, src]) =>
      src.split('\n').flatMap((line, i) => {
        const code = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '').replace(/^\s*\*.*$/, '')
        return /selfScore[^\n]*[^=!<>]\s\+\s|\s\+\s[^\n]*selfScore|reduce\([^)]*selfScore|selfScore[^\n]*\.reduce|Math\.(round|floor|ceil)\([^)]*selfScore/.test(code)
          ? [`${path}:${i + 1}: ${line.trim()}`] : []
      }))
    expect(offenders).toEqual([])
  })

  it('only sums MAXIMUM marks (configuration), in one place', () => {
    const reducers = appSources.flatMap(([path, src]) => (src.match(/\.reduce\(/g) ? [path] : []))
    expect(reducers).toEqual(['/src/data/scoring.ts'])
  })

  it('has no scoring formulas, thresholds or percentage-to-score conversion in app code', () => {
    const banned = /\b(calculateScore|computeScore|scoreFromPercent|percentToScore|passPercentToMarks|publicationScore|fdpScore|scoringFormula|scoreThreshold)\b/
    expect(appSources.filter(([, src]) => banned.test(src)).map(([p]) => p)).toEqual([])
  })
})
