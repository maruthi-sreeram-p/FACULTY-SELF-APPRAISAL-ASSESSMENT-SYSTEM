import { useId } from 'react'
import type { FieldDef, FieldValues } from '../../types'
import { cn, optionLabel, optionValue } from '../../lib/utils'
import { FormField, controlCls } from './FormField'

/**
 * Renders any schema FieldDef as the right control.
 * `values` is the whole values object because a "Duration (From–To)" field owns two keys.
 */
export function FieldInput({ field, values, onChange, error, className, disabled }: {
  field: FieldDef
  values: FieldValues
  onChange: (patch: FieldValues) => void
  error?: string
  className?: string
  disabled?: boolean
}) {
  const listId = useId()
  const value = values[field.key] ?? ''
  const set = (v: string) => onChange({ [field.key]: v })
  const wide = field.wide || field.type === 'textarea' || field.type === 'daterange'
  const cls = cn(className, wide && 'sm:col-span-full')

  if (field.type === 'daterange') {
    const msg = error ?? field.hint
    return (
      <fieldset className={cls} disabled={disabled || field.readOnly}>
        <legend className="type-label mb-1.5 text-primary">{field.label}</legend>
        <div className="grid grid-cols-2 gap-3">
          {(['From', 'To'] as const).map((side) => (
            <label key={side} className="block">
              <span className="type-meta mb-1 block text-muted">{side}</span>
              <input
                type="date" aria-label={`${field.label}: ${side}`} aria-invalid={error ? true : undefined}
                value={values[`${field.key}${side}`] ?? ''}
                onChange={(e) => onChange({ [`${field.key}${side}`]: e.target.value })}
                className={controlCls(!!error)}
              />
            </label>
          ))}
        </div>
        {msg && <p className={cn('type-meta mt-1.5', error ? 'text-danger' : 'text-muted')} role={error ? 'alert' : undefined}>{msg}</p>}
      </fieldset>
    )
  }

  if (field.type === 'checkbox') {
    return (
      <div className={cls}>
        <label className="flex cursor-pointer items-start gap-3 text-[13.5px]">
          <input type="checkbox" checked={value === 'true'} disabled={disabled || field.readOnly} onChange={(e) => set(String(e.target.checked))}
            className="mt-0.5 h-4 w-4 accent-[var(--accent-solid)]" aria-invalid={error ? true : undefined} />
          <span>{field.label}{field.required && <span className="ml-0.5 text-danger" aria-hidden>*</span>}</span>
        </label>
        {error && <p className="type-meta mt-1.5 text-danger">{error}</p>}
      </div>
    )
  }

  return (
    <FormField label={field.label} required={field.required} hint={field.hint} error={error} className={cls}>
      {(p) => {
        const common = { ...p, value, disabled: disabled || field.readOnly, placeholder: field.placeholder, onChange: (e: { target: { value: string } }) => set(e.target.value) }
        switch (field.type) {
          case 'textarea':
            return <textarea {...common} rows={3} className={controlCls(!!error, true)} />
          case 'select':
            return (
              <select {...common} className={controlCls(!!error)}>
                <option value="">Select…</option>
                {field.options?.map((o) => <option key={optionValue(o)} value={optionValue(o)}>{optionLabel(o)}</option>)}
              </select>
            )
          case 'combobox':
            return (
              <>
                <input {...common} type="text" list={listId} autoComplete="off" className={controlCls(!!error)} />
                <datalist id={listId}>{field.options?.map((o) => <option key={optionValue(o)} value={optionValue(o)} />)}</datalist>
              </>
            )
          case 'number':
            return <input {...common} type="number" inputMode="decimal" min={field.min} max={field.max} step={field.step ?? 'any'} className={controlCls(!!error)} />
          default:
            return <input {...common} type={field.type} className={controlCls(!!error)} />
        }
      }}
    </FormField>
  )
}
