import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2, Save, Send } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { pickSections, sectionKeyOf, toContent, fromContent } from '../contract/mapper'
import type { AppraisalDto, AppraisalSectionKey } from '../contract/dto'
import { STEPS, stepById } from '../data/appraisalSchema'
import { isCadreCode } from '../data/scoring'
import { LOCKED_STATUSES, errorMessage, services } from '../lib/api'
import { COMPLETABLE, blockingIssues, notAddressed as getNotAddressed, stepState, type StepState } from '../lib/completion'
import { useAsync } from '../lib/useAsync'
import { useDocuments } from '../lib/useDocuments'
import { formatDate } from '../lib/utils'
import type { AppraisalData, BlockValue, FieldValues } from '../types'
import { Stepper } from '../components/appraisal/Stepper'
import { StepContent } from '../components/appraisal/StepContent'
import { controlCls } from '../components/forms/FormField'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { PageHeader } from '../components/ui/PageHeader'
import { ErrorState, LoadingSkeleton } from '../components/ui/States'
import { StatusBadge } from '../components/ui/StatusBadge'

type SaveState = 'saved' | 'saving' | 'dirty' | 'error'

export default function AppraisalWizard() {
  const { year = '', stepId = 'general' } = useParams()
  const { setYear } = useApp()
  // Opening the workflow creates the DRAFT appraisal for this academic year if none exists (POST /appraisals).
  const q = useAsync(() => services.ensureAppraisal(year), [year])
  useEffect(() => { if (year) setYear(year) }, [year, setYear])

  if (!stepById(stepId)) return <Navigate to={`/appraisals/${year}/step/general`} replace />
  if (q.loading) {
    return (
      <div aria-busy="true" aria-label="Loading appraisal" className="grid gap-8 lg:grid-cols-[264px_minmax(0,1fr)]">
        <LoadingSkeleton className="hidden h-[480px] rounded-card lg:block" />
        <div className="space-y-4"><LoadingSkeleton className="h-8 w-1/3" /><LoadingSkeleton className="h-72 rounded-card" /></div>
      </div>
    )
  }
  if (q.error || !q.data) return <Card pad="none"><ErrorState message={q.error ?? 'Unable to load appraisal'} onRetry={q.reload} /></Card>
  return <Wizard key={q.data.id} initial={q.data} year={year} stepId={stepId} />
}

function Wizard({ initial, year, stepId }: { initial: AppraisalDto; year: string; stepId: string }) {
  const nav = useNavigate()
  const toast = useToast()
  const docs = useDocuments(year)

  // Form state mirrors the contract content; every input is a string (see src/contract/mapper.ts).
  const [data, setData] = useState<AppraisalData>(() => fromContent(initial))
  const [status, setStatus] = useState(initial.status)
  const [savedAt, setSavedAt] = useState<string | null>(initial.updatedAt)
  const [saveState, setSaveState] = useState<SaveState>('saved')
  const [showErrors, setShowErrors] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const readOnly = LOCKED_STATUSES.includes(status)
  const step = stepById(stepId)!
  const idx = STEPS.findIndex((s) => s.id === stepId)
  const base = `/appraisals/${year}/step`

  const latest = useRef(data)
  latest.current = data
  const version = useRef(initial.version)
  /** contract section → change counter. Only changed sections are sent (PATCH). */
  const dirty = useRef(new Map<AppraisalSectionKey, number>())

  const save = useCallback(async (quiet = true) => {
    if (readOnly) return true
    const sent = new Map(dirty.current)
    if (sent.size === 0) { setSaveState('saved'); return true }
    setSaveState('saving')
    try {
      const payload = pickSections(toContent(latest.current), sent.keys())
      const r = await services.patchAppraisal(initial.id, version.current, payload)
      version.current = r.version
      for (const [k, n] of sent) if (dirty.current.get(k) === n) dirty.current.delete(k)
      setSavedAt(r.updatedAt); setStatus(r.status)
      setSaveState(dirty.current.size ? 'dirty' : 'saved')
      if (!quiet) toast('Draft saved', 'success')
      return true
    } catch (e) {
      setSaveState('error'); toast(`Could not save: ${errorMessage(e)}`, 'error')
      return false
    }
  }, [readOnly, initial.id, toast])

  // Autosave 1.5 s after the last change.
  useEffect(() => {
    if (saveState !== 'dirty') return
    const t = setTimeout(() => save(), 1500)
    return () => clearTimeout(t)
  }, [data, saveState, save])

  const update = (sid: string, blockId: string, v: BlockValue) => {
    if (readOnly) return
    const key = sectionKeyOf(blockId)
    dirty.current.set(key, (dirty.current.get(key) ?? 0) + 1)
    setData((d) => ({ ...d, [sid]: { ...(d[sid] ?? {}), [blockId]: v } }))
    setSaveState('dirty')
  }

  const states = useMemo(() => {
    const m: Record<string, StepState> = {}
    STEPS.forEach((s) => { m[s.id] = stepState(s, data) })
    return m
  }, [data])
  const issues = useMemo(() => blockingIssues(STEPS, data), [data])
  const unaddressed = useMemo(() => getNotAddressed(STEPS, data), [data])

  // Maximum marks follow the cadre in Part A (a snapshot of the faculty profile, edited by the faculty).
  const chosen = (data.general?.generalInfo as FieldValues | undefined)?.cadre
  const cadre = isCadreCode(chosen) ? chosen : null

  const go = async (to: string) => {
    if (dirty.current.size) await save()
    setShowErrors(false)
    nav(`${base}/${to}`)
    window.scrollTo({ top: 0 })
  }

  const submit = async () => {
    setSubmitting(true)
    try {
      if (dirty.current.size && !(await save())) return
      const r = await services.submit(initial.id)
      version.current = r.version
      setStatus(r.status); setSavedAt(r.updatedAt); setConfirming(false)
      toast('Appraisal submitted', 'success')
    } catch (e) { toast(errorMessage(e), 'error') } finally { setSubmitting(false) }
  }

  const completable = STEPS.filter(COMPLETABLE)
  const doneCount = completable.filter((s) => states[s.id] === 'complete').length
  const pct = Math.round((doneCount / completable.length) * 100) // display only

  return (
    <>
      <PageHeader
        eyebrow={`${step.pdfRef} · Step ${idx + 1} of ${STEPS.length}`}
        title={step.title}
        description={step.description}
        actions={<>
          <SaveIndicator state={saveState} at={savedAt} onRetry={() => save(false)} readOnly={readOnly} />
          <StatusBadge status={status} />
          {!readOnly && <Button variant="secondary" size="sm" onClick={() => save(false)} loading={saveState === 'saving'}><Save size={14} aria-hidden /> Save draft</Button>}
        </>}
      />

      <div className="grid gap-8 lg:grid-cols-[264px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-card border border-border-subtle bg-surface p-2.5">
            <div className="px-2 pb-3 pt-1.5">
              <div className="flex items-baseline justify-between">
                <p className="type-label">Your progress</p>
                <p className="type-meta tabular-nums text-muted">{doneCount}/{completable.length}</p>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-muted" aria-hidden>
                <div className="h-full rounded-full bg-accent-solid transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <Stepper steps={STEPS} current={stepId} states={states} base={base} />
          </div>
        </aside>

        <div className="min-w-0 max-w-[920px]">
          {/* Compact progress below lg */}
          <div className="mb-5 rounded-card border border-border-subtle bg-surface p-4 lg:hidden">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-medium">{doneCount} of {completable.length} sections complete</span>
              <span className="tabular-nums text-muted">{pct}%</span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-muted" aria-hidden>
              <div className="h-full rounded-full bg-accent-solid transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
            </div>
            <label className="mt-3 block">
              <span className="sr-only">Jump to step</span>
              <select value={stepId} onChange={(e) => go(e.target.value)} className={controlCls()}>
                {STEPS.map((s, i) => <option key={s.id} value={s.id}>{i + 1}. {s.title}{states[s.id] === 'complete' && s.kind === 'sections' ? ' ✓' : states[s.id] === 'error' ? ' !' : ''}</option>)}
              </select>
            </label>
          </div>

          {readOnly && (
            <div role="status" className="mb-5 flex items-center gap-2.5 rounded-card border border-info/25 bg-info-subtle px-4 py-3 text-[13.5px] text-info">
              <CheckCircle2 size={16} aria-hidden /> This appraisal is {status.toLowerCase().replace('_', ' ')} and can no longer be edited.
            </div>
          )}

          <div key={stepId} className="animate-page space-y-5">
            <StepContent step={step} ctx={{
              year, data, readOnly, showErrors, update, docs, scoreSheet: initial.scoreSheet, reviews: initial.reviews, cadre,
              states, issues, notAddressed: unaddressed, submitted: readOnly, onSubmit: () => setConfirming(true),
            }} />
          </div>

          <div className="sticky bottom-0 z-10 mt-8 flex items-center justify-between gap-3 border-t border-border-subtle bg-background/90 py-3.5 backdrop-blur-md">
            <Button variant="secondary" disabled={idx === 0} onClick={() => go(STEPS[idx - 1].id)}><ArrowLeft size={15} aria-hidden /> Previous</Button>
            <span className="type-meta hidden tabular-nums text-muted sm:block">Step {idx + 1} of {STEPS.length}</span>
            {idx < STEPS.length - 1
              ? <Button onClick={() => { setShowErrors(true); go(STEPS[idx + 1].id) }}>Next <ArrowRight size={15} aria-hidden /></Button>
              : <span className="w-[88px]" aria-hidden />}
          </div>
        </div>
      </div>

      <ConfirmDialog open={confirming} loading={submitting} icon={<Send size={18} />} title="Submit your appraisal?" confirmLabel="Submit appraisal" cancelLabel="Keep editing"
        message={`You are about to submit your ${year} self-appraisal.`}
        onCancel={() => setConfirming(false)} onConfirm={submit}>
        <ul className="space-y-1.5 rounded-control bg-surface-muted/70 p-3 text-[13px]">
          <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-success" aria-hidden />Nothing is blocking submission.</li>
          {unaddressed.length > 0 && (
            <li className="flex gap-2"><AlertCircle size={14} className="mt-0.5 shrink-0 text-warning" aria-hidden />
              {unaddressed.length} {unaddressed.length === 1 ? 'section has' : 'sections have'} no entries and no “nothing to report” answer ({unaddressed.map((s) => s.code ?? s.title).join(', ')}).
            </li>
          )}
          <li className="flex gap-2"><AlertCircle size={14} className="mt-0.5 shrink-0 text-warning" aria-hidden />Once submitted, you can no longer edit this appraisal.</li>
        </ul>
      </ConfirmDialog>
    </>
  )
}

function SaveIndicator({ state, at, onRetry, readOnly }: { state: SaveState; at: string | null; onRetry: () => void; readOnly: boolean }) {
  if (readOnly) return null
  const cls = 'type-meta inline-flex items-center gap-1.5'
  if (state === 'saving') return <span className={`${cls} text-secondary`} role="status"><Loader2 size={12} className="animate-spin" aria-hidden /> Saving…</span>
  if (state === 'dirty') return <span className={`${cls} text-warning`} role="status"><span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden /> Unsaved changes</span>
  if (state === 'error') return <button onClick={onRetry} className={`${cls} text-danger underline underline-offset-2`}><AlertCircle size={12} aria-hidden /> Save failed. Retry</button>
  return (
    <span className={`${cls} text-muted`} role="status">
      <CheckCircle2 key={at ?? 'none'} size={12} className="animate-check text-success" aria-hidden /> {at ? `Saved ${formatDate(at, true)}` : 'No changes yet'}
    </span>
  )
}
