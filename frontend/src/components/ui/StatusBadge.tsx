import type { AppraisalStatus } from '../../contract/dto'
import { cn } from '../../lib/utils'

const map: Record<AppraisalStatus, { label: string; cls: string }> = {
  NOT_STARTED: { label: 'Not started', cls: 'bg-surface-muted text-secondary' },
  DRAFT: { label: 'Draft', cls: 'bg-surface-muted text-secondary' },
  SUBMITTED: { label: 'Submitted', cls: 'bg-accent-subtle text-accent' },
  UNDER_REVIEW: { label: 'Under review', cls: 'bg-warning-subtle text-warning' },
  APPROVED: { label: 'Approved', cls: 'bg-success-subtle text-success' },
  RETURNED: { label: 'Returned', cls: 'bg-warning-subtle text-warning' },
  REJECTED: { label: 'Rejected', cls: 'bg-danger-subtle text-danger' },
}

export function StatusBadge({ status, className }: { status: AppraisalStatus; className?: string }) {
  const s = map[status] ?? map.NOT_STARTED
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-current/15', s.cls, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {s.label}
    </span>
  )
}
