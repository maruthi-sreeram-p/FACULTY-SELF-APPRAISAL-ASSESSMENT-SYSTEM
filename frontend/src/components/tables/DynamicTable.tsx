import { useState, type ReactNode } from 'react'
import { Copy, Pencil, Plus, Table2, Trash2 } from 'lucide-react'
import type { FieldDef, Row } from '../../types'
import { fieldsErrors } from '../../lib/completion'
import { formatDay, formatMonth, optionLabel, optionValue } from '../../lib/utils'
import { Button, IconButton } from '../ui/Button'
import { Card } from '../ui/Card'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { Modal } from '../ui/Modal'
import { EmptyState } from '../ui/States'
import { FieldInput } from '../forms/FieldInput'
import { DataTable, type Column } from './DataTable'

const blank = (fields: FieldDef[]): Row => ({ id: crypto.randomUUID(), ...Object.fromEntries(fields.flatMap((f) => (f.type === 'daterange' ? [[`${f.key}From`, ''], [`${f.key}To`, '']] : [[f.key, '']]))) })

const dash = <span className="text-muted">—</span>

function cell(f: FieldDef, r: Row): ReactNode {
  if (f.type === 'daterange') {
    const [a, b] = [r[`${f.key}From`], r[`${f.key}To`]]
    return a || b ? `${formatDay(a) || '…'} → ${formatDay(b) || '…'}` : dash
  }
  const v = r[f.key]
  if (!v) return dash
  if (f.type === 'date') return formatDay(v)
  if (f.type === 'month') return formatMonth(v)
  if (f.type === 'select') {
    const opt = f.options?.find((x) => optionValue(x) === v)
    return opt ? (typeof opt === 'string' ? opt : (opt.short ?? optionLabel(opt))) : v
  }
  return v
}

export function DynamicTable({ title, description, fields, rows, onChange, rowLabel, readOnly, showErrors }: {
  title: string; description?: string
  fields: FieldDef[]; rows: Row[]; onChange: (rows: Row[]) => void
  rowLabel: string; readOnly?: boolean; showErrors?: boolean
}) {
  const [editing, setEditing] = useState<Row | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleting, setDeleting] = useState<Row | null>(null)

  const columns: Column<Row>[] = fields.filter((f) => f.summary).map((f) => ({
    key: f.key, header: f.label, align: f.type === 'number' ? 'right' : undefined, render: (r) => cell(f, r),
  }))

  const openNew = () => { setEditing(blank(fields)); setIsNew(true); setErrors({}) }
  const openEdit = (r: Row) => { setEditing({ ...r }); setIsNew(false); setErrors({}) }
  const close = () => setEditing(null)

  const commit = () => {
    if (!editing) return
    const errs = fieldsErrors(fields, editing)
    if (Object.keys(errs).length) { setErrors(errs); return }
    onChange(isNew ? [...rows, editing] : rows.map((r) => (r.id === editing.id ? editing : r)))
    close()
  }
  const duplicate = (r: Row) => onChange([...rows, { ...r, id: crypto.randomUUID() }])
  const incomplete = (r: Row) => Object.keys(fieldsErrors(fields, r)).length > 0
  const name = (r: Row) => r[fields[0].key] || rowLabel

  return (
    <Card pad="none">
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-3.5">
        <div className="min-w-0">
          <h2 className="type-section">{title}</h2>
          <p className="type-meta text-muted">{description ?? `${rows.length} ${rows.length === 1 ? 'entry' : 'entries'}`}</p>
        </div>
        {!readOnly && rows.length > 0 && <Button size="sm" className="shrink-0" onClick={openNew}><Plus size={15} aria-hidden /> Add {rowLabel}</Button>}
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<Table2 size={22} />} title={`No ${rowLabel} entries yet`}
          description={readOnly ? 'Nothing was recorded here.' : 'Add your first entry. You can edit, duplicate or remove it at any time before submitting.'}
          action={!readOnly && <Button onClick={openNew}><Plus size={15} aria-hidden /> Add {rowLabel}</Button>} />
      ) : (
        <div className="p-3 sm:p-0">
          <DataTable
            serial caption={title} columns={columns} rows={rows} rowKey={(r) => r.id}
            actions={readOnly ? undefined : (r) => (
              <>
                {showErrors && incomplete(r) && <span className="type-meta mr-2 rounded-md bg-danger-subtle px-2 py-0.5 font-medium text-danger">Incomplete</span>}
                <IconButton label={`Edit ${name(r)}`} onClick={() => openEdit(r)}><Pencil size={15} /></IconButton>
                <IconButton label={`Duplicate ${name(r)}`} onClick={() => duplicate(r)}><Copy size={15} /></IconButton>
                <IconButton label={`Delete ${name(r)}`} tone="danger" onClick={() => setDeleting(r)}><Trash2 size={15} /></IconButton>
              </>
            )}
          />
        </div>
      )}

      <Modal open={!!editing} onClose={close} size="lg" title={`${isNew ? 'Add' : 'Edit'} ${rowLabel}`}
        description={title}
        footer={<>
          <Button variant="secondary" onClick={close} className="max-sm:w-full">Cancel</Button>
          <Button onClick={commit} className="max-sm:w-full">{isNew ? `Add ${rowLabel}` : 'Save changes'}</Button>
        </>}>
        {editing && (
          <form className="grid gap-x-4 gap-y-4 pb-2 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); commit() }}>
            {fields.map((f) => (
              <FieldInput key={f.key} field={f} values={editing} error={errors[f.key]}
                onChange={(patch) => {
                  setEditing({ ...editing, ...patch })
                  setErrors((e) => ({ ...e, [f.key]: '' }))
                }} />
            ))}
            <button type="submit" className="sr-only">Save</button>
          </form>
        )}
      </Modal>

      <ConfirmDialog open={!!deleting} tone="danger" title="Delete this entry?" confirmLabel="Delete entry"
        message={`“${deleting ? name(deleting) : ''}” will be removed from this table. The change is saved with your draft.`}
        onCancel={() => setDeleting(null)}
        onConfirm={() => { onChange(rows.filter((r) => r.id !== deleting!.id)); setDeleting(null) }} />
    </Card>
  )
}
