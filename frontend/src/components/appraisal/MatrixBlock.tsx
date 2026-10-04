import type { ReactNode } from 'react'
import type { FieldValues, MatrixBlockDef } from '../../types'
import { controlCls } from '../forms/FormField'
import { Card } from '../ui/Card'

/** Rows × columns of numbers, e.g. "Research profile metrics" (platform × metric). Table on ≥ sm, cards on phones. */
export function MatrixBlock({ block, title, badge, values, readOnly, onChange }: {
  block: MatrixBlockDef; title: string; badge?: ReactNode
  values: FieldValues; readOnly: boolean; onChange: (v: FieldValues) => void
}) {
  const key = (r: string, c: string) => `${r}.${c}`
  const input = (r: { key: string; label: string }, c: { key: string; label: string }) => (
    <input
      type="number" inputMode="numeric" min={0} step="any" disabled={readOnly}
      aria-label={`${r.label}: ${c.label}`}
      value={values[key(r.key, c.key)] ?? ''}
      onChange={(e) => onChange({ ...values, [key(r.key, c.key)]: e.target.value })}
      className={`${controlCls()} tabular-nums`}
    />
  )

  return (
    <Card pad="none">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border-subtle px-5 py-3.5">
        <h2 className="type-section">{title}</h2>
        {badge}
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[560px] text-left text-[13.5px]">
          <caption className="sr-only">{title}</caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="type-eyebrow px-5 py-2.5 font-semibold text-muted">{block.rowHeader}</th>
              {block.cols.map((c) => <th key={c.key} scope="col" className="type-eyebrow px-3 py-2.5 font-semibold text-muted">{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((r) => (
              <tr key={r.key} className="border-b border-border-subtle last:border-0">
                <th scope="row" className="whitespace-nowrap px-5 py-2.5 text-left font-medium">{r.label}</th>
                {block.cols.map((c) => <td key={c.key} className="px-3 py-2">{input(r, c)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 p-3 sm:hidden">
        {block.rows.map((r) => (
          <fieldset key={r.key} className="rounded-card border border-border-subtle p-3.5">
            <legend className="px-1 text-[13.5px] font-medium">{r.label}</legend>
            <div className="grid grid-cols-2 gap-3">
              {block.cols.map((c) => (
                <label key={c.key} className="block">
                  <span className="type-meta mb-1 block text-muted">{c.label}</span>
                  {input(r, c)}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    </Card>
  )
}
