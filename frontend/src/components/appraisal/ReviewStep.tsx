import { ArrowRight, Check, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import { STEPS } from '../../data/appraisalSchema'
import type { Issue, StepState } from '../../lib/completion'
import { cn } from '../../lib/utils'
import type { AppraisalDto } from '../../contract/dto'
import type { StepDef } from '../../types'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

const STATE_LABEL: Record<StepState, string> = { complete: 'Complete', partial: 'In progress', empty: 'Not started', error: 'Needs attention' }

function Marker({ state }: { state: StepState }) {
  if (state === 'complete') return <span aria-hidden className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success-subtle text-success ring-1 ring-inset ring-success/30"><Check size={12} strokeWidth={3} /></span>
  if (state === 'error') return <span aria-hidden className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-danger-subtle text-[11px] font-bold leading-none text-danger ring-1 ring-inset ring-danger/30">!</span>
  if (state === 'partial') return <span aria-hidden className="h-5 w-5 shrink-0 rounded-full border-2 border-accent/50" />
  return <span aria-hidden className="h-5 w-5 shrink-0 rounded-full border-2 border-border-strong" />
}

export function ReviewStep({ year, states, issues, notAddressed, reviews, enclosedCount, submitted, onSubmit }: {
  year: string
  states: Record<string, StepState>
  issues: Issue[]
  notAddressed: StepDef[]
  reviews: AppraisalDto['reviews']
  enclosedCount: number
  submitted: boolean
  onSubmit: () => void
}) {
  const link = (id: string) => `/appraisals/${year}/step/${id}`
  const ready = issues.length === 0

  return (
    <>
      <Card pad="none">
        <div className="border-b border-border-subtle px-5 py-4 sm:px-6">
          <h2 className="type-section">Section checklist</h2>
          <p className="mt-1 text-[13px] text-secondary">Every part of the report, in the order of the PDF.</p>
        </div>
        <ul>
          {STEPS.filter((s) => s.kind !== 'review').map((s) => {
            let state: StepState = states[s.id] ?? 'empty'
            let label = STATE_LABEL[state]
            if (s.kind === 'scores') { label = enclosedCount ? `${enclosedCount} document type${enclosedCount > 1 ? 's' : ''} enclosed` : 'No documents enclosed'; state = enclosedCount ? 'complete' : 'empty' }
            if (s.kind === 'official') { const r = reviews?.[s.official!]; state = r?.remarks ? 'complete' : 'empty'; label = r?.remarks ? 'Recorded' : 'Completed by officer' }
            return (
              <li key={s.id} className="flex items-center gap-3 border-b border-border-subtle px-5 py-3 last:border-0 sm:px-6">
                <Marker state={state} />
                <span className="min-w-0 flex-1 text-[13.5px]">
                  {s.title}
                  {s.code && <span className="type-meta ml-2 text-muted">{s.code}</span>}
                </span>
                <span className={cn('type-meta text-right', state === 'complete' ? 'text-success' : state === 'error' ? 'text-danger' : state === 'partial' ? 'text-warning' : 'text-muted')}>{label}</span>
                {!submitted && s.kind !== 'official' && <Link to={link(s.id)} className="text-[13px] font-medium text-accent hover:underline">{state === 'complete' ? 'View' : 'Open'}</Link>}
              </li>
            )
          })}
        </ul>
      </Card>

      {submitted ? (
        <Card variant="highlight" className="animate-pop">
          <div className="flex items-start gap-4">
            <span aria-hidden className="animate-check grid h-11 w-11 shrink-0 place-items-center rounded-full bg-success-subtle text-success ring-1 ring-inset ring-success/30"><Check size={20} strokeWidth={2.75} /></span>
            <div>
              <h2 className="type-section text-base">Appraisal submitted</h2>
              <p className="mt-1 text-sm text-secondary">Your {year} self-appraisal has been submitted. You can follow its status from the dashboard.</p>
              <Link to="/" className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-accent hover:underline">Go to dashboard <ArrowRight size={14} aria-hidden /></Link>
            </div>
          </div>
        </Card>
      ) : (
        <Card variant={ready ? 'highlight' : 'flat'}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="type-section">{ready ? 'Ready to submit' : 'Not ready yet'}</h2>
              <p className="mt-0.5 text-[13px] text-secondary">
                {ready ? 'Nothing is blocking submission.' : `${issues.length} ${issues.length === 1 ? 'item needs' : 'items need'} attention first.`}
              </p>
            </div>
            <Button disabled={!ready} onClick={onSubmit}><Send size={14} aria-hidden /> Submit appraisal</Button>
          </div>
          {issues.length > 0 && (
            <ul className="mt-4 space-y-1.5 border-t border-border-subtle pt-4 text-[13.5px]">
              {issues.map((i) => <li key={`${i.stepId}-${i.blockId}`} className="flex items-center justify-between gap-3"><span>{i.message}</span><Link to={link(i.stepId)} className="shrink-0 text-[13px] font-medium text-accent hover:underline">Fix</Link></li>)}
            </ul>
          )}
          {notAddressed.length > 0 && (
            <p className="type-meta mt-4 border-t border-border-subtle pt-4 text-muted">
              Not blocking: {notAddressed.length} {notAddressed.length === 1 ? 'section has' : 'sections have'} no entries and no “nothing to report” answer ({notAddressed.map((s) => s.code ?? s.title).join(', ')}).
              <span className="ml-1">Provisional rule: the PDF does not say which sections are mandatory.</span>
            </p>
          )}
        </Card>
      )}
    </>
  )
}
