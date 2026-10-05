import { useId, useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CadreCode, ComponentScoreDto, CriterionCode, ScoreSheetDto } from '../../contract/dto'
import { CADRES, COMPONENT_CRITERIA, CRITERIA, MAX_MARKS, componentsFor, isCadreCode, totalMax } from '../../data/scoring'
import { cn } from '../../lib/utils'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { controlCls } from '../forms/FormField'
import { ProvisionalTag } from '../ui/Provisional'

const dash = <span className="text-muted">—</span>

/** Labels such as "Pass/result performance" may wrap after a slash, never mid-word. */
const Breakable = ({ text }: { text: string }) => (
  <>{text.split('/').map((part, i) => <span key={i}>{i > 0 && <>/<wbr /></>}{part}</span>)}</>
)

/**
 * Score sheet (PDF Part B, section 11), the scoring annexure for B1 to B5, and Annexure A.
 *
 * DISPLAY ONLY. The backend is the source of truth for maximum marks and self-scores (ScoreSheetDto), at criterion
 * and component level. Until it returns a score sheet, the maximum marks shown are the printed ones for the chosen
 * cadre (scoring.ts). Nothing is calculated here: no component score, and no criterion total from components.
 *
 * REQUIRES COLLEGE CONFIRMATION: how a component score is produced, and B6 to B9 breakdowns (none are defined).
 */
export function ScoreSheet({ scoreSheet, cadre, year }: { scoreSheet: ScoreSheetDto | null; cadre: CadreCode | null; year: string }) {
  const uid = useId()
  const [open, setOpen] = useState<Set<CriterionCode>>(new Set())
  const [refCadre, setRefCadre] = useState<string>(cadre ?? '')

  const mismatch = scoreSheet && cadre && scoreSheet.maxScore !== totalMax(cadre)
  const backend = (code: CriterionCode) => scoreSheet?.criteria.find((c) => c.criterion === code)
  const maxFor = (code: CriterionCode) => backend(code)?.maxMarks ?? (cadre ? MAX_MARKS[cadre][code] : null)
  const totalMaxShown = scoreSheet ? scoreSheet.maxScore : cadre ? totalMax(cadre) : null
  const cadreLabel = CADRES.find((c) => c.code === cadre)?.label

  /** Backend components when present, otherwise the printed ones with no self-score. */
  const componentsOf = (code: CriterionCode): ComponentScoreDto[] => {
    const fromBackend = backend(code)?.components
    if (fromBackend?.length) return fromBackend
    return componentsFor(cadre, code).map((c) => ({ componentNo: c.no, label: c.label, maxMarks: c.max, selfScore: null }))
  }

  const expandable = COMPONENT_CRITERIA.filter((c) => componentsOf(c).length > 0)
  const allOpen = expandable.length > 0 && expandable.every((c) => open.has(c))
  const toggle = (code: CriterionCode) => setOpen((s) => { const n = new Set(s); if (n.has(code)) n.delete(code); else n.add(code); return n })
  const toggleAll = () => setOpen(allOpen ? new Set() : new Set(expandable))

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
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border-subtle px-5 py-4">
          <div>
            <h2 className="type-section">Self-appraisal score sheet</h2>
            <p className="mt-0.5 text-[13px] text-secondary">Maximum marks for your cadre are given in Annexure A.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {cadreLabel && <span className="type-meta rounded-md bg-accent-subtle px-2 py-1 font-medium text-accent">Cadre: {cadreLabel}</span>}
            {expandable.length > 0 && (
              <Button variant="secondary" size="sm" onClick={toggleAll} aria-pressed={allOpen}>
                {allOpen ? 'Hide component breakdown' : 'Show component breakdown'}
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13.5px] sm:min-w-[480px]">
            <caption className="sr-only">Self-appraisal score sheet with the component breakdown of criteria B1 to B5</caption>
            <thead>
              <tr className="border-b border-border align-bottom">
                <th scope="col" className="type-eyebrow w-10 whitespace-nowrap py-2.5 pl-3 pr-1 font-semibold text-muted sm:w-16 sm:pl-5 sm:pr-2">S. No</th>
                <th scope="col" className="type-eyebrow px-2 py-2.5 font-semibold text-muted sm:px-3">Criteria</th>
                <th scope="col" className="type-eyebrow px-2 py-2.5 text-right font-semibold text-muted sm:px-3"><span className="sr-only sm:not-sr-only">Max. Marks (my cadre)</span><span aria-hidden className="sm:hidden">Max</span></th>
                <th scope="col" className="type-eyebrow px-3 py-2.5 text-right font-semibold text-muted sm:px-5"><span className="sr-only sm:not-sr-only">Self-Score</span><span aria-hidden className="sm:hidden">Self</span></th>
              </tr>
            </thead>
            {CRITERIA.map((c) => {
              const row = backend(c.code)
              const self = row?.selfScore
              const max = maxFor(c.code)
              const comps = componentsOf(c.code)
              const isOpen = open.has(c.code) && comps.length > 0
              const panelId = `${uid}-${c.code}`
              return (
                <tbody key={c.code} id={panelId} className="border-b border-border-subtle">
                  <tr className={cn(isOpen && 'bg-surface-muted/50')}>
                    <td className="py-3 pl-3 pr-1 tabular-nums text-muted sm:pl-5 sm:pr-2">{c.no}</td>
                    <td className="px-2 py-3 sm:px-3">
                      <div className="flex items-start gap-2">
                        {comps.length > 0 ? (
                          <button
                            type="button" onClick={() => toggle(c.code)} aria-expanded={isOpen} aria-controls={panelId}
                            aria-label={`${isOpen ? 'Hide' : 'Show'} components of ${c.title}`}
                            className="-ml-1 mt-px grid h-5 w-5 shrink-0 place-items-center rounded text-muted transition-colors duration-150 hover:bg-surface-muted hover:text-primary"
                          >
                            <ChevronRight size={15} aria-hidden className={cn('transition-transform duration-200', isOpen && 'rotate-90')} />
                          </button>
                        ) : <span aria-hidden className="w-4 shrink-0" />}
                        <div className="min-w-0">
                          <Link to={`/appraisals/${year}/step/${c.stepId}`} className="hover:text-accent hover:underline">{c.title}</Link>
                          {!COMPONENT_CRITERIA.includes(c.code) && (
                            <p className="type-meta mt-0.5 text-muted">No component breakdown is defined for this criterion (requires college confirmation).</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right tabular-nums sm:px-3">{max === null ? dash : max}</td>
                    <td className="px-3 py-3 text-right tabular-nums sm:px-5">{self === undefined || self === null ? dash : self}</td>
                  </tr>
                  {isOpen && comps.map((k) => (
                    <tr key={k.componentNo} className="bg-surface-muted/30 text-[13px]">
                      <td />
                      <td className="py-2 pl-8 pr-2 text-secondary sm:pl-[3.1rem] sm:pr-3"><span aria-hidden className="mr-2 text-muted">•</span><Breakable text={k.label} /></td>
                      <td className="px-2 py-2 text-right tabular-nums text-secondary sm:px-3"><span className="sr-only">Maximum </span>{k.maxMarks}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-secondary sm:px-5"><span className="sr-only">Self-score </span>{k.selfScore === null ? dash : k.selfScore}</td>
                    </tr>
                  ))}
                </tbody>
              )
            })}
            <tbody>
              <tr className="bg-surface-muted/60 font-semibold">
                <td />
                <td className="px-2 py-3 sm:px-3">Total</td>
                <td className="px-2 py-3 text-right tabular-nums sm:px-3">{totalMaxShown === null ? dash : totalMaxShown}</td>
                <td className="px-3 py-3 text-right tabular-nums sm:px-5">{scoreSheet?.selfScore ?? dash}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-2 border-t border-border-subtle px-5 py-3 text-[13px] text-muted">
          <p className="flex flex-wrap items-center gap-2">
            <ProvisionalTag note="The scoring annexure gives maximum marks for the components of B1 to B5, but no rule for turning evidence into a component score, no statement of who enters scores, and no component breakdown for B6 to B9. This application displays scores supplied by the system and calculates nothing, including criterion totals from components." />
            <span>{scoreSheet?.selfScore != null ? 'Self-scores are provided by the system.' : 'Self-scores will appear once the system provides them.'} “Any Other Contributions” has no score row.</span>
          </p>
        </div>
      </Card>

      <ComponentReference cadre={isCadreCode(refCadre) ? refCadre : null} value={refCadre} onChange={setRefCadre} />

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

/** Scoring annexure for B1 to B5: component maximum marks for any cadre. Reference only. */
function ComponentReference({ cadre, value, onChange }: { cadre: CadreCode | null; value: string; onChange: (v: string) => void }) {
  const id = useId()
  return (
    <details className="group rounded-card border border-border-subtle bg-surface">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-card px-5 py-3.5 text-[13.5px] font-medium hover:bg-surface-muted/60">
        Scoring annexure: components of B1 to B5
        <ChevronDown size={16} aria-hidden className="text-muted transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="space-y-4 border-t border-border-subtle px-5 py-4">
        <div className="max-w-xs">
          <label htmlFor={id} className="type-label mb-1.5 block">Cadre</label>
          <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={controlCls()}>
            <option value="">Select a cadre…</option>
            {CADRES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
          </select>
        </div>

        {cadre ? (
          <div className="overflow-x-auto rounded-card border border-border-subtle">
            <table className="w-full text-left text-[13.5px] sm:min-w-[420px]">
              <caption className="sr-only">Component maximum marks for {CADRES.find((c) => c.code === cadre)?.label}, criteria B1 to B5</caption>
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="type-eyebrow px-4 py-2.5 font-semibold text-muted">Criterion and component</th>
                  <th scope="col" className="type-eyebrow px-4 py-2.5 text-right font-semibold text-muted">Max. Marks</th>
                </tr>
              </thead>
              {COMPONENT_CRITERIA.map((code) => {
                const crit = CRITERIA.find((c) => c.code === code)!
                return (
                  <tbody key={code} className="border-b border-border-subtle last:border-0">
                    <tr className="bg-surface-muted/60 font-medium">
                      <th scope="row" className="px-4 py-2 text-left font-semibold"><span className="mr-2 tabular-nums text-muted">B{crit.no}</span>{crit.title}</th>
                      <td className="px-4 py-2 text-right tabular-nums font-semibold">{MAX_MARKS[cadre][code]}</td>
                    </tr>
                    {componentsFor(cadre, code).map((k) => (
                      <tr key={k.no} className="border-t border-border-subtle/60">
                        <td className="py-1.5 pl-8 pr-4 text-secondary"><span aria-hidden className="mr-2 text-muted">•</span><Breakable text={k.label} /></td>
                        <td className="px-4 py-1.5 text-right tabular-nums text-secondary">{k.max}</td>
                      </tr>
                    ))}
                  </tbody>
                )
              })}
            </table>
          </div>
        ) : (
          <p className="text-[13px] text-muted">Choose a cadre to see the maximum marks of each component.</p>
        )}

        <p className="type-meta text-muted">
          Components are defined for B1 to B5 only. How each component is scored, and the detailed methodology for B6 to B9 (Funded Projects / Consultancy, Patents, Books &amp; IPR, Outreach, Memberships / Awards), are not defined and require college confirmation.
        </p>
      </div>
    </details>
  )
}
