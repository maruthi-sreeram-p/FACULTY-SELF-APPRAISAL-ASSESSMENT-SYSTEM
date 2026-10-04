import { useRef, type KeyboardEvent } from 'react'
import { Check } from 'lucide-react'
import type { StepState } from '../../lib/completion'
import { cn } from '../../lib/utils'

export interface Tab { id: string; label: string; state: StepState }

/** Accessible tab list for the sub-sections of a step (e.g. Research: (a) … (d)). */
export function SectionTabs({ tabs, active, onChange, idBase }: { tabs: Tab[]; active: string; onChange: (id: string) => void; idBase: string }) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({})

  const onKey = (e: KeyboardEvent, i: number) => {
    const move = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : e.key === 'Home' ? -i : e.key === 'End' ? tabs.length - 1 - i : 0
    if (!move) return
    e.preventDefault()
    const next = tabs[(i + move + tabs.length) % tabs.length]
    onChange(next.id)
    refs.current[next.id]?.focus()
  }

  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div role="tablist" aria-label="Sections" className="flex w-max min-w-full gap-1 border-b border-border">
        {tabs.map((t, i) => {
          const on = t.id === active
          return (
            <button
              key={t.id} ref={(el) => { refs.current[t.id] = el }}
              role="tab" id={`${idBase}-tab-${t.id}`} aria-selected={on} aria-controls={`${idBase}-panel-${t.id}`} tabIndex={on ? 0 : -1}
              onClick={() => onChange(t.id)} onKeyDown={(e) => onKey(e, i)}
              className={cn('relative -mb-px flex items-center gap-2 whitespace-nowrap rounded-t-control px-3.5 py-2.5 text-[13.5px] transition-colors duration-150',
                on ? 'font-semibold text-primary' : 'font-medium text-secondary hover:text-primary')}
            >
              {t.label}
              {t.state === 'complete' && <span aria-hidden className="grid h-4 w-4 place-items-center rounded-full bg-success-subtle text-success"><Check size={10} strokeWidth={3.5} /></span>}
              {t.state === 'error' && <span aria-hidden className="grid h-4 w-4 place-items-center rounded-full bg-danger-subtle text-[10px] font-bold leading-none text-danger">!</span>}
              {t.state === 'partial' && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent-solid" />}
              <span className="sr-only">{t.state === 'complete' ? ', complete' : t.state === 'error' ? ', needs attention' : t.state === 'partial' ? ', in progress' : ''}</span>
              <span aria-hidden className={cn('absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent-solid transition-opacity duration-200', on ? 'opacity-100' : 'opacity-0')} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
