import { AlertTriangle, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CADRES, CRITERIA, MAX_MARKS, totalMax, type Cadre } from '../../data/scoring'
import type { ScoreSummary } from '../../types'
import { cn } from '../../lib/utils'
import { Card } from '../ui/Card'
import { ProvisionalTag } from '../ui/Provisional'

const SHORT: Record<Cadre, string> = {
  'Lecturer': 'Lecturer', 'Assistant Professor': 'Asst. Prof.', 'Senior Assistant Professor': 'Sr. Asst. Prof.',
  'Associate Professor': 'Assoc. Prof.', 'Professor': 'Professor',
}

const dash = <span className="text-muted">—</span>

/**
 * Score sheet (PDF Part B, section 11) and Annexure A.
 * DISPLAY ONLY: maximum marks come from the printed Annexure A (scoring.ts);
 * self-scores come from the backend. Nothing is calculated here.
 */
export function ScoreSheet({ scores, cadre, year }: { scores: ScoreSummary | null; cadre: Cadre | null; year: string }) {
  const mismatch = scores && cadre && scores.maxScore !== totalMax(cadre)

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
          <p>The system reports a maximum of {scores.maxScore}, but Annexure A gives {totalMax(cadre)} for {cadre}. Please check your cadre.</p>
        </div>
      )}

      <Card pad="none">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle px-5 py-4">
          <div>
            <h2 className="type-section">Self-appraisal score sheet</h2>
            <p className="mt-0.5 text-[13px] text-secondary">Maximum marks for your cadre are given in Annexure A.</p>
          </div>
          {cadre && <span className="type-meta rounded-md bg-accent-subtle px-2 py-1 font-medium text-accent">Cadre: {cadre}</span>}
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
                const self = scores?.criteria?.[c.id]
                return (
                  <tr key={c.id} className="border-b border-border-subtle">
                    <td className="py-3 pl-5 pr-2 tabular-nums text-muted">{c.no}</td>
                    <td className="px-3 py-3"><Link to={`/appraisals/${year}/step/${c.stepId}`} className="hover:text-accent hover:underline">{c.title}</Link></td>
                    <td className="px-3 py-3 text-right tabular-nums">{cadre ? MAX_MARKS[cadre][c.id] : dash}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{self === undefined ? dash : self}</td>
                  </tr>
                )
              })}
              <tr className="bg-surface-muted/60 font-semibold">
                <td />
                <td className="px-3 py-3">Total</td>
                <td className="px-3 py-3 text-right tabular-nums">{cadre ? totalMax(cadre) : dash}</td>
                <td className="px-5 py-3 text-right tabular-nums">{scores ? scores.selfScore : dash}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-border-subtle px-5 py-3 text-[13px] text-muted">
          <ProvisionalTag note="The PDF has a blank Self-Score column but no formula, so this application only displays self-scores supplied by the system. Whether faculty type their own scores is not defined." />
          <span>{scores ? 'Self-scores are provided by the system.' : 'Self-scores will appear once the system provides them.'} “Any Other Contributions” has no score row.</span>
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
                  <th key={k} scope="col" className={cn('type-eyebrow px-3 py-2.5 text-right font-semibold', k === cadre ? 'text-accent' : 'text-muted')}>{SHORT[k]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CRITERIA.map((c) => (
                <tr key={c.id} className="border-b border-border-subtle">
                  <td className="py-2.5 pl-5 pr-2 tabular-nums text-muted">{c.no}</td>
                  <td className="px-3 py-2.5">{c.title}</td>
                  {CADRES.map((k) => <td key={k} className={cn('px-3 py-2.5 text-right tabular-nums', k === cadre && 'bg-accent-subtle/60 font-semibold')}>{MAX_MARKS[k][c.id]}</td>)}
                </tr>
              ))}
              <tr className="font-semibold">
                <td /><td className="px-3 py-2.5">Total</td>
                {CADRES.map((k) => <td key={k} className={cn('px-3 py-2.5 text-right tabular-nums', k === cadre && 'bg-accent-subtle/60')}>{totalMax(k)}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="type-meta border-t border-border-subtle px-5 py-3 italic text-muted">The same criteria and maximum marks are used by the Appraisal Panel in the Faculty Performance Evaluation Form.</p>
      </details>
    </div>
  )
}
