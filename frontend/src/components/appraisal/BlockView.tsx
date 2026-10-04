import { useState } from 'react'
import type { BlockDef, BlockValue, FieldValues, MatrixBlockDef, Row, StepData } from '../../types'
import { blockState, fieldsErrors, isNone, noneKey, sanityErrors } from '../../lib/completion'
import { cn } from '../../lib/utils'
import { FieldInput } from '../forms/FieldInput'
import { FormSection } from '../forms/FormSection'
import { DynamicTable } from '../tables/DynamicTable'
import { ProvisionalTag } from '../ui/Provisional'
import { MatrixBlock } from './MatrixBlock'

/** Renders one schema block (fields, repeating table or matrix) and its "nothing to report" switch. */
export function BlockView({ block, fallbackTitle, data, onBlock, readOnly, showErrors }: {
  block: BlockDef
  fallbackTitle: string
  data: StepData | undefined
  onBlock: (blockId: string, value: BlockValue) => void
  readOnly: boolean
  showErrors: boolean
}) {
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const title = block.title ?? fallbackTitle
  const none = isNone(data, block.id)
  const state = blockState(block, data)
  const hasData = state === 'complete' || state === 'partial' || state === 'error'
  const canNone = block.allowNone !== false && !block.optional && !readOnly
  const badge = block.provisional ? <ProvisionalTag note={block.provisional} /> : undefined

  const toggle = canNone && !hasData && (
    <label className={cn('flex cursor-pointer items-center gap-3 rounded-card border px-4 py-3 text-[13.5px] transition-colors duration-150',
      none ? 'border-accent/40 bg-accent-subtle/60' : 'border-border-subtle bg-surface hover:border-border')}>
      <input type="checkbox" checked={none} onChange={(e) => onBlock(noneKey(block.id), { none: String(e.target.checked) })}
        className="h-4 w-4 accent-[var(--accent-solid)]" />
      <span>Nothing to report in <span className="font-medium">{title}</span></span>
    </label>
  )

  if (none && !hasData) return <>{toggle}</>

  let body
  if (block.kind === 'fields') {
    const values = (data?.[block.id] as FieldValues | undefined) ?? {}
    const errs = fieldsErrors(block.fields, values)
    const sanity = sanityErrors(block.fields, values)
    body = (
      <FormSection title={title} description={block.description} badge={badge} columns={block.columns}>
        {block.note && <p className="rounded-card border border-border-subtle bg-surface-muted/60 p-4 text-[13.5px] leading-relaxed text-secondary sm:col-span-full">{block.note}</p>}
        {block.fields.map((f) => (
          <div key={f.key} className={f.wide || f.type === 'textarea' || f.type === 'daterange' ? 'sm:col-span-full' : undefined}
            onBlur={() => setTouched((t) => ({ ...t, [f.key]: true }))}>
            <FieldInput field={f} values={values} disabled={readOnly}
              onChange={(patch) => !readOnly && onBlock(block.id, { ...values, ...patch })}
              error={sanity[f.key] ?? ((showErrors || touched[f.key]) ? errs[f.key] : undefined)} />
          </div>
        ))}
      </FormSection>
    )
  } else if (block.kind === 'table') {
    const rows = (data?.[block.id] as Row[] | undefined) ?? []
    body = (
      <div className="space-y-2">
        {badge && <div className="flex">{badge}</div>}
        <DynamicTable title={title} description={block.description} fields={block.rowFields} rows={rows} rowLabel={block.rowLabel}
          readOnly={readOnly} showErrors={showErrors || state === 'error'} onChange={(r) => onBlock(block.id, r)} />
      </div>
    )
  } else {
    const values = (data?.[block.id] as FieldValues | undefined) ?? {}
    body = <MatrixBlock block={block as MatrixBlockDef} title={title} badge={badge} values={values} readOnly={readOnly} onChange={(v) => onBlock(block.id, v)} />
  }

  return <div className="space-y-3">{toggle}{body}</div>
}
