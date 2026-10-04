import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { Button } from './Button'

function Tile({ children, tone = 'accent' }: { children: ReactNode; tone?: 'accent' | 'danger' }) {
  return (
    <div className="relative mb-5 h-14 w-14" aria-hidden>
      <span className="absolute inset-0 rotate-6 rounded-2xl border border-border-subtle bg-surface-muted" />
      <span className={cn('relative grid h-14 w-14 place-items-center rounded-2xl border border-border bg-surface shadow-card',
        tone === 'danger' ? 'text-danger' : 'text-accent')}>{children}</span>
    </div>
  )
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {icon && <Tile>{icon}</Tile>}
      <h3 className="type-section">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-secondary">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton h-4 w-full', className)} aria-hidden />
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border-subtle" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <LoadingSkeleton className="h-4 w-1/3" />
          <LoadingSkeleton className="hidden h-4 w-1/6 sm:block" />
          <LoadingSkeleton className="ml-auto h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-14 text-center">
      <Tile tone="danger"><AlertTriangle size={22} /></Tile>
      <h3 className="type-section">Something went wrong</h3>
      <p className="mt-1.5 max-w-sm text-sm text-secondary">{message}</p>
      {onRetry && <Button className="mt-5" variant="secondary" onClick={onRetry}>Try again</Button>}
    </div>
  )
}
