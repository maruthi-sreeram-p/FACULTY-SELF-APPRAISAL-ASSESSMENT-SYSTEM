import type { ReactNode } from 'react'
import { Card } from './Card'

/** Metric card: label, one value, optional hint and footer action. */
export function StatCard({ label, value, hint, icon, footer }: {
  label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode; footer?: ReactNode
}) {
  return (
    <Card variant="flat" pad="sm" className="flex flex-col sm:p-5">
      <div className="flex items-center gap-2 text-secondary">
        {icon && <span aria-hidden className="text-muted">{icon}</span>}
        <p className="type-label">{label}</p>
      </div>
      <div className="mt-3 text-2xl font-semibold leading-none tracking-tight tabular-nums">{value}</div>
      {hint && <p className="type-meta mt-2 text-muted">{hint}</p>}
      {footer && <div className="mt-auto pt-4 text-[13px]">{footer}</div>}
    </Card>
  )
}
