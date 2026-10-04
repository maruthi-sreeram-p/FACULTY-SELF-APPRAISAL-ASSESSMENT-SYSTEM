import { useId, useState } from 'react'
import { sectionState, type Issue, type StepState } from '../../lib/completion'
import type { Cadre } from '../../data/scoring'
import type { AppraisalData, AppraisalDraft, BlockValue, FieldValues, StepDef } from '../../types'
import type { DocumentsApi } from '../../lib/useDocuments'
import { BlockView } from './BlockView'
import { OfficialReview } from './OfficialReview'
import { ReviewStep } from './ReviewStep'
import { ScoreSheet } from './ScoreSheet'
import { SectionTabs } from './SectionTabs'
import { SupportingDocuments } from './SupportingDocuments'
import { ProvisionalNotice, ProvisionalTag } from '../ui/Provisional'

export interface StepCtx {
  year: string
  data: AppraisalData
  readOnly: boolean
  showErrors: boolean
  update: (stepId: string, blockId: string, v: BlockValue) => void
  docs: DocumentsApi
  scores: AppraisalDraft['scores']
  reviews: AppraisalDraft['reviews']
  cadre: Cadre | null
  states: Record<string, StepState>
  issues: Issue[]
  notAddressed: StepDef[]
  submitted: boolean
  onSubmit: () => void
}

export function StepContent({ step, ctx }: { step: StepDef; ctx: StepCtx }) {
  const notice = step.provisional && step.kind !== 'review' ? <ProvisionalNotice note={step.provisional} /> : null

  if (step.kind === 'official') {
    return <>{notice}<OfficialReview kind={step.official!} review={ctx.reviews?.[step.official!]} /></>
  }

  if (step.kind === 'scores') {
    const enclosed = (ctx.data.scores?.enclosed as FieldValues | undefined) ?? {}
    return (
      <>
        <ScoreSheet scores={ctx.scores} cadre={ctx.cadre} year={ctx.year} />
        <SupportingDocuments year={ctx.year} docs={ctx.docs} enclosed={enclosed} readOnly={ctx.readOnly}
          onEnclosed={(v) => ctx.update('scores', 'enclosed', v)} />
      </>
    )
  }

  if (step.kind === 'review') {
    const enclosed = (ctx.data.scores?.enclosed as FieldValues | undefined) ?? {}
    const count = Object.entries(enclosed).filter(([k, v]) => k !== 'othersSpecify' && v === 'true').length
    return (
      <ReviewStep year={ctx.year} states={ctx.states} issues={ctx.issues} notAddressed={ctx.notAddressed} reviews={ctx.reviews}
        enclosedCount={count} submitted={ctx.submitted} onSubmit={ctx.onSubmit} />
    )
  }

  return <>{notice}<Sections step={step} ctx={ctx} /></>
}

function Sections({ step, ctx }: { step: StepDef; ctx: StepCtx }) {
  const sections = step.sections ?? []
  const [active, setActive] = useState(sections[0]?.id)
  const base = useId()
  const current = sections.find((s) => s.id === active) ?? sections[0]
  const multi = sections.length > 1

  return (
    <div className="space-y-5">
      {multi && (
        <SectionTabs idBase={base} active={current.id} onChange={setActive}
          tabs={sections.map((s) => ({ id: s.id, label: s.tabLabel ?? s.title, state: sectionState(step, s.id, ctx.data) }))} />
      )}
      <div
        role={multi ? 'tabpanel' : undefined} id={multi ? `${base}-panel-${current.id}` : undefined}
        aria-labelledby={multi ? `${base}-tab-${current.id}` : undefined} tabIndex={multi ? 0 : undefined}
        className="space-y-5 outline-none"
      >
        {(current.description || current.provisional) && (
          <div className="flex flex-wrap items-center gap-3 text-[13px] text-secondary">
            {current.description}
            {current.provisional && <ProvisionalTag note={current.provisional} />}
          </div>
        )}
        {current.blocks.map((b) => (
          <BlockView key={b.id} block={b} fallbackTitle={current.title} data={ctx.data[step.id]} readOnly={ctx.readOnly} showErrors={ctx.showErrors}
            onBlock={(blockId, v) => ctx.update(step.id, blockId, v)} />
        ))}
      </div>
    </div>
  )
}
