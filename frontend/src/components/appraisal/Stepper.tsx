import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { StepDef } from '../../types'
import type { StepState } from '../../lib/completion'
import { cn } from '../../lib/utils'

/** ✓ completed · ● current · ○ upcoming · ! needs attention */
function Marker({ state, current }: { state: StepState; current: boolean }) {
  if (current) {
    return (
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 border-accent bg-surface" aria-hidden>
        <span className="h-2 w-2 rounded-full bg-accent-solid" />
      </span>
    )
  }
  if (state === 'complete') {
    return <span className="animate-check grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success-subtle text-success ring-1 ring-inset ring-success/30" aria-hidden><Check size={12} strokeWidth={3} /></span>
  }
  if (state === 'error') {
    return <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-danger-subtle text-[11px] font-bold leading-none text-danger ring-1 ring-inset ring-danger/30" aria-hidden>!</span>
  }
  return <span className={cn('h-5 w-5 shrink-0 rounded-full border-2 bg-surface', state === 'partial' ? 'border-accent/50' : 'border-border-strong')} aria-hidden />
}

const sr: Record<StepState, string> = { complete: 'completed', error: 'needs attention', partial: 'in progress', empty: 'not started' }

export function Stepper({ steps, current, states, base }: {
  steps: StepDef[]; current: string; states: Record<string, StepState>; base: string
}) {
  // group consecutive steps by PDF part
  const groups: { part: string; steps: StepDef[] }[] = []
  for (const s of steps) {
    const g = groups[groups.length - 1]
    if (g && g.part === s.part) g.steps.push(s)
    else groups.push({ part: s.part, steps: [s] })
  }

  return (
    <nav aria-label="Appraisal steps">
      <ul className="space-y-3">
        {groups.map((g) => (
          <li key={g.part}>
            <h3 className="type-eyebrow px-2 pb-1.5 pt-1 text-muted">{g.part}</h3>
            <ol>
              {g.steps.map((s, i) => {
                const st = states[s.id] ?? 'empty'
                const active = s.id === current
                return (
                  <li key={s.id} className="relative">
                    {i < g.steps.length - 1 && <span aria-hidden className="absolute left-[18px] top-[30px] -bottom-[2px] w-px bg-border" />}
                    <Link
                      to={`${base}/${s.id}`} aria-current={active ? 'step' : undefined}
                      className={cn('relative flex items-start gap-3 rounded-control px-2 py-[7px] text-[13px] leading-snug transition-colors duration-150',
                        active ? 'bg-accent-subtle font-semibold text-primary' : 'text-secondary hover:bg-surface-muted hover:text-primary')}
                    >
                      <span className="mt-px flex shrink-0"><Marker state={st} current={active} /></span>
                      <span className="line-clamp-2 min-w-0 flex-1" title={s.title}>{s.title}</span>
                      {s.code && <span aria-hidden className="type-meta mt-0.5 shrink-0 tabular-nums text-muted">{s.code}</span>}
                      <span className="sr-only">, {s.pdfRef}{active ? ', current step' : ''}{s.kind === 'sections' ? `, ${sr[st]}` : ''}</span>
                    </Link>
                  </li>
                )
              })}
            </ol>
          </li>
        ))}
      </ul>
    </nav>
  )
}
