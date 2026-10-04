import { Hourglass } from 'lucide-react'
import type { ScoreSheetDto } from '../../contract/dto'
import { Card } from '../ui/Card'

/**
 * Display-only. `maxScore` and `selfScore` are supplied by the backend (ScoreSheetDto);
 * the frontend performs no scoring or aggregation.
 */
export function ScoreCard({ scoreSheet, compact }: { scoreSheet: ScoreSheetDto | null; compact?: boolean }) {
  const pad = compact ? 'sm' : 'md'
  if (!scoreSheet || scoreSheet.selfScore === null) {
    return (
      <Card variant="flat" pad={pad} className={compact ? 'sm:p-5' : ''}>
        <p className="type-label text-secondary">Self-score</p>
        <div className="mt-3 flex items-start gap-3">
          <span aria-hidden className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-muted text-muted"><Hourglass size={15} /></span>
          <div>
            <p className="text-sm font-medium">Awaiting score</p>
            <p className="type-meta text-muted">The system provides your score after processing.</p>
          </div>
        </div>
      </Card>
    )
  }
  const pct = scoreSheet.maxScore > 0 ? Math.min(100, (scoreSheet.selfScore / scoreSheet.maxScore) * 100) : 0 // bar width only
  return (
    <Card variant="flat" pad={pad} className={compact ? 'sm:p-5' : ''}>
      <p className="type-label text-secondary">Self-score</p>
      <p className="mt-3 text-2xl font-semibold leading-none tracking-tight tabular-nums">
        {scoreSheet.selfScore}<span className="text-sm font-medium text-muted"> / {scoreSheet.maxScore}</span>
      </p>
      <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-surface-muted" aria-hidden>
        <div className="h-full rounded-full bg-accent-solid transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
      </div>
      <p className="type-meta mt-2 text-muted">Provided by the system</p>
    </Card>
  )
}
