import { useId, type ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { Card } from '../ui/Card'

const cols = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

/** A titled block of fields. The header is separated from the body so long forms stay scannable. */
export function FormSection({ title, description, badge, columns = 2, children }: {
  title: string; description?: string; badge?: ReactNode; columns?: 1 | 2 | 3 | 4; children: ReactNode
}) {
  const id = useId()
  return (
    <Card pad="none">
      <section role="group" aria-labelledby={id}>
        <header className="border-b border-border-subtle px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 id={id} className="type-section">{title}</h2>
            {badge}
          </div>
          {description && <p className="mt-1 text-[13px] text-secondary">{description}</p>}
        </header>
        <div className={cn('grid gap-x-5 gap-y-5 p-5 sm:p-6', cols[columns])}>{children}</div>
      </section>
    </Card>
  )
}
