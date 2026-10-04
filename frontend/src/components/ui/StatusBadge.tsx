import type { AppraisalStatus } from '../../types'
import { cn } from '../../lib/utils'

const map: Record<AppraisalStatus, { label: string; cls: string }> = {
  not_started: { label: 'Not started', cls: 'bg-surface-muted text-secondary' },
  draft: { label: 'Draft', cls: 'bg-surface-muted text-secondary' },
  in_progress: { label: 'In progress', cls: 'bg-info-subtle text-info' },
  submitted: { label: 'Submitted', cls: 'bg-accent-subtle text-accent' },
  under_review: { label: 'Under review', cls: 'bg-warning-subtle text-warning' },
  approved: { label: 'Approved', cls: 'bg-success-subtle text-success' },
  returned: { label: 'Returned', cls: 'bg-warning-subtle text-warning' },
  rejected: { label: 'Rejected', cls: 'bg-danger-subtle text-danger' },
}

export function StatusBadge({ status, className }: { status: AppraisalStatus; className?: string }) {
  const s = map[status] ?? map.not_started
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-current/15', s.cls, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {s.label}
    </span>
  )
}
