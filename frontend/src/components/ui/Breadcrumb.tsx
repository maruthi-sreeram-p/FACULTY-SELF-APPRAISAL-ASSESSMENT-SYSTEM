import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

export interface Crumb { label: string; to?: string }

/** On phones only the current page is shown; the full trail appears from sm up. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-[13px] text-secondary">
        {items.map((c, i) => {
          const last = i === items.length - 1
          return (
            <li key={c.label} className={cn('min-w-0 items-center gap-1.5', last ? 'flex' : 'hidden sm:flex')}>
              {c.to && !last
                ? <Link to={c.to} className="whitespace-nowrap rounded transition-colors duration-150 hover:text-primary">{c.label}</Link>
                : <span aria-current={last ? 'page' : undefined} className={cn('truncate', last ? 'font-medium text-primary' : 'whitespace-nowrap')}>{c.label}</span>}
              {!last && <ChevronRight size={13} aria-hidden className="shrink-0 text-muted" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
