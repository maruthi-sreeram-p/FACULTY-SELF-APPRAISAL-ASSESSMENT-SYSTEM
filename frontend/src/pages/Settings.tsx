import { Check, Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { cn } from '../lib/utils'

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const opts = [
    { v: 'light', label: 'Light', hint: 'Bright, neutral workspace', icon: Sun },
    { v: 'dark', label: 'Dark', hint: 'Low-glare navy workspace', icon: Moon },
  ] as const
  return (
    <>
      <PageHeader title="Settings" description="Personalise how the application looks on this device." />
      <Card pad="none" className="max-w-2xl">
        <fieldset>
          <legend className="sr-only">Appearance</legend>
          <div className="border-b border-border-subtle px-5 py-4 sm:px-6">
            <h2 className="type-section">Appearance</h2>
            <p className="mt-1 text-[13px] text-secondary">Choose a theme. Your choice is remembered on this device.</p>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
            {opts.map(({ v, label, hint, icon: Icon }) => {
              const on = theme === v
              return (
                <label key={v} className={cn('relative flex cursor-pointer items-center gap-3.5 rounded-card border p-4 transition duration-150 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent',
                  on ? 'border-accent bg-accent-subtle/60' : 'border-border hover:border-border-strong hover:bg-surface-muted/60')}>
                  <input type="radio" name="theme" value={v} checked={on} onChange={() => setTheme(v)} className="sr-only" />
                  <span aria-hidden className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-control border bg-surface', on ? 'border-accent/40 text-accent' : 'border-border text-secondary')}><Icon size={17} /></span>
                  <span className="min-w-0 flex-1"><span className="block text-[13.5px] font-medium">{label}</span><span className="type-meta block text-muted">{hint}</span></span>
                  {on && <span aria-hidden className="animate-check grid h-5 w-5 place-items-center rounded-full bg-accent-solid text-white"><Check size={12} strokeWidth={3} /></span>}
                </label>
              )
            })}
          </div>
        </fieldset>
      </Card>
    </>
  )
}
