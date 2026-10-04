import { AlertTriangle, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CadreCode, ScoreSheetDto } from '../../contract/dto'
import { CADRES, CRITERIA, MAX_MARKS, totalMax } from '../../data/scoring'
import { cn } from '../../lib/utils'
import { Card } from '../ui/Card'
import { ProvisionalTag } from '../ui/Provisional'

const dash = <span className="text-muted">—</span>

/**
 * Score sheet (PDF Part B, section 11) and Annexure A.
 * DISPLAY ONLY. The backend is the source of truth for maximum marks and self-scores (ScoreSheetDto).
 * Until it returns a score sheet, the maximum marks shown are the printed Annexure A values for the chosen
 * cadre (scoring.ts). Nothing is calculated here.
 */
export function ScoreSheet({ scoreSheet, cadre, year }: { scoreSheet: ScoreSheetDto | null; cadre: CadreCode | null; year: string }) {
  const mismatch = scoreSheet && cadre && scoreSheet.maxScore !== totalMax(cadre)
  const backend = (code: string) => scoreSheet?.criteria.find((c) => c.criterion === code)
  const maxFor = (code: (typeof CRITERIA)[number]['code']) => backend(code)?.maxMarks ?? (cadre ? MAX_MARKS[cadre][code] : null)
  const totalMaxShown = scoreSheet ? scoreSheet.maxScore : cadre ? totalMax(cadre) : null
  const cadreLabel = CADRES.find((c) => c.code === cadre)?.label

  return (
    <div className="space-y-5">
      {!cadre && (
        <div role="alert" className="flex items-start gap-3 rounded-card border border-warning/25 bg-warning-subtle px-4 py-3 text-[13.5px]">
          <AlertTriangle size={16} aria-hidden className="mt-0.5 shrink-0 text-warning" />
          <p>Your maximum marks depend on your cadre. <Link to={`/appraisals/${year}/step/general`} className="font-medium text-accent hover:underline">Select Designation (Cadre) in General Information</Link> to see them.</p>
        </div>
      )}
      {mismatch && (
        <div role="alert" className="flex items-start gap-3 rounded-card border border-warning/25 bg-warning-subtle px-4 py-3 text-[13.5px]">
          <AlertTriangle size={16} aria-hidden className="mt-0.5 shrink-0 text-warning" />
          <p>The system reports a maximum of {scoreSheet.maxScore}, but Annexure A gives {totalMax(cadre)} for {cadreLabel}. Please check your cadre.</p>
        </div>
      )}

      <Card pad="none">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle px-5 py-4">
          <div>
            <h2 className="type-section">Self-appraisal score sheet</h2>
            <p className="mt-0.5 text-[13px] text-secondary">Maximum marks for your cadre are given in Annexure A.</p>
          </div>
          {cadreLabel && <span className="type-meta rounded-md bg-accent-subtle px-2 py-1 font-medium text-accent">Cadre: {cadreLabel}</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-[13.5px]">
            <caption className="sr-only">Self-appraisal score sheet</caption>
            <thead>
              <tr className="border-b border-border align-bottom">
                <th scope="col" className="type-eyebrow w-16 whitespace-nowrap py-2.5 pl-5 pr-2 font-semibold text-muted">S. No</th>
                <th scope="col" className="type-eyebrow px-3 py-2.5 font-semibold text-muted">Criteria</th>
                <th scope="col" className="type-eyebrow px-3 py-2.5 text-right font-semibold text-muted">Max. Marks (my cadre)</th>
                <th scope="col" className="type-eyebrow px-5 py-2.5 text-right font-semibold text-muted">Self-Score</th>
              </tr>
            </thead>
            <tbody>
              {CRITERIA.map((c) => {
                const self = backend(c.code)?.selfScore
                const max = maxFor(c.code)
                return (
                  <tr key={c.code} className="border-b border-border-subtle">
                    <td className="py-3 pl-5 pr-2 tabular-nums text-muted">{c.no}</td>
                    <td className="px-3 py-3"><Link to={`/appraisals/${year}/step/${c.stepId}`} className="hover:text-accent hover:underline">{c.title}</Link></td>
                    <td className="px-3 py-3 text-right tabular-nums">{max === null ? dash : max}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{self === undefined || self === null ? dash : self}</td>
                  </tr>
                )
              })}
              <tr className="bg-surface-muted/60 font-semibold">
                <td />
                <td className="px-3 py-3">Total</td>
                <td className="px-3 py-3 text-right tabular-nums">{totalMaxShown === null ? dash : totalMaxShown}</td>
                <td className="px-5 py-3 text-right tabular-nums">{scoreSheet?.selfScore ?? dash}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-border-subtle px-5 py-3 text-[13px] text-muted">
          <ProvisionalTag note="The PDF has a blank Self-Score column but no formula, so this application only displays self-scores supplied by the system. Whether faculty type their own scores is not defined." />
          <span>{scoreSheet?.selfScore != null ? 'Self-scores are provided by the system.' : 'Self-scores will appear once the system provides them.'} “Any Other Contributions” has no score row.</span>
        </div>
      </Card>

      <details className="group rounded-card border border-border-subtle bg-surface">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-card px-5 py-3.5 text-[13.5px] font-medium hover:bg-surface-muted/60">
          Annexure A: Cadre-wise maximum marks
          <ChevronDown size={16} aria-hidden className="text-muted transition-transform duration-200 group-open:rotate-180" />
        </summary>
        <div className="overflow-x-auto border-t border-border-subtle">
          <table className="w-full min-w-[620px] text-left text-[13.5px]">
            <caption className="sr-only">Cadre-wise maximum marks (Annexure A)</caption>
            <thead>
              <tr className="border-b border-border align-bottom">
                <th scope="col" className="type-eyebrow w-16 whitespace-nowrap py-2.5 pl-5 pr-2 font-semibold text-muted">S. No</th>
                <th scope="col" className="type-eyebrow px-3 py-2.5 font-semibold text-muted">Criteria</th>
                {CADRES.map((k) => (
                  <th key={k.code} scope="col" className={cn('type-eyebrow px-3 py-2.5 text-right font-semibold', k.code === cadre ? 'text-accent' : 'text-muted')}>{k.short}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CRITERIA.map((c) => (
                <tr key={c.code} className="border-b border-border-subtle">
                  <td className="py-2.5 pl-5 pr-2 tabular-nums text-muted">{c.no}</td>
                  <td className="px-3 py-2.5">{c.title}</td>
                  {CADRES.map((k) => <td key={k.code} className={cn('px-3 py-2.5 text-right tabular-nums', k.code === cadre && 'bg-accent-subtle/60 font-semibold')}>{MAX_MARKS[k.code][c.code]}</td>)}
                </tr>
              ))}
              <tr className="font-semibold">
                <td /><td className="px-3 py-2.5">Total</td>
                {CADRES.map((k) => <td key={k.code} className={cn('px-3 py-2.5 text-right tabular-nums', k.code === cadre && 'bg-accent-subtle/60')}>{totalMax(k.code)}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="type-meta border-t border-border-subtle px-5 py-3 italic text-muted">The same criteria and maximum marks are used by the Appraisal Panel in the Faculty Performance Evaluation Form.</p>
      </details>
    </div>
  )
}
