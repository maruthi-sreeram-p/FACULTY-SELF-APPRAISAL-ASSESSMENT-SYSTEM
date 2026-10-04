import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export interface Column<T> { key: string; header: string; render: (row: T) => ReactNode; align?: 'right'; className?: string }

/** Table on ≥ sm screens (scrolls horizontally if needed); stacked cards on phones. `serial` adds the PDF's "S. No" column. */
export function DataTable<T>({ columns, rows, rowKey, actions, caption, serial }: {
  columns: Column<T>[]; rows: T[]; rowKey: (r: T) => string; actions?: (r: T) => ReactNode; caption: string; serial?: boolean
}) {
  return (
    <>
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-left text-[13.5px]" style={{ minWidth: Math.max(520, columns.length * 104 + (serial ? 56 : 0) + (actions ? 120 : 0)) }}>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border align-bottom">
              {serial && <th scope="col" className="type-eyebrow w-12 whitespace-nowrap py-2.5 pl-5 pr-2 font-semibold text-muted">S. No</th>}
              {columns.map((c, i) => (
                <th key={c.key} scope="col" className={cn('type-eyebrow px-3 py-2.5 font-semibold leading-snug text-muted', !serial && i === 0 && 'pl-5', c.align === 'right' && 'text-right')}>{c.header}</th>
              ))}
              {actions && <th scope="col" className="w-px px-4 py-2.5"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, n) => (
              <tr key={rowKey(r)} className="group border-b border-border-subtle transition-colors duration-150 last:border-0 hover:bg-surface-muted/70">
                {serial && <td className="py-3 pl-5 pr-2 tabular-nums text-muted">{n + 1}</td>}
                {columns.map((c, i) => (
                  <td key={c.key} className={cn('max-w-[240px] truncate px-3 py-3', !serial && i === 0 && 'pl-5', c.align === 'right' && 'text-right tabular-nums', c.className)}>{c.render(r)}</td>
                ))}
                {actions && <td className="px-3 py-1.5"><div className="flex items-center justify-end gap-0.5">{actions(r)}</div></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-2.5 sm:hidden" aria-label={caption}>
        {rows.map((r, n) => (
          <li key={rowKey(r)} className="rounded-card border border-border-subtle bg-surface p-3.5">
            {serial && <p className="type-eyebrow mb-1.5 text-muted">S. No {n + 1}</p>}
            <dl className="space-y-2">
              {columns.map((c, i) => (
                <div key={c.key} className={cn('flex items-baseline justify-between gap-4', i === 0 ? 'text-[14px] font-medium' : 'text-[13px]')}>
                  <dt className={cn('shrink-0 text-muted', i === 0 && 'sr-only')}>{c.header}</dt>
                  <dd className={cn('min-w-0 truncate', i === 0 ? 'w-full' : 'text-right')}>{c.render(r)}</dd>
                </div>
              ))}
            </dl>
            {actions && <div className="mt-3 flex items-center justify-end gap-0.5 border-t border-border-subtle pt-2.5">{actions(r)}</div>}
          </li>
        ))}
      </ul>
    </>
  )
}
