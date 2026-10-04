import type { ReactNode } from 'react'

export function PageHeader({ title, description, eyebrow, actions }: { title: string; description?: string; eyebrow?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 sm:mb-8">
      <div className="min-w-0">
        {eyebrow && <p className="type-eyebrow mb-2 text-accent">{eyebrow}</p>}
        <h1 className="type-page">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-secondary">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  )
}
