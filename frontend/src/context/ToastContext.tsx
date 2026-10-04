import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { AlertCircle, Check, Info, X } from 'lucide-react'
import { cn } from '../lib/utils'
import { IconButton } from '../components/ui/Button'

type Tone = 'success' | 'error' | 'info'
interface ToastItem { id: number; tone: Tone; message: string }

const Ctx = createContext<((message: string, tone?: Tone) => void) | null>(null)
let seq = 0

const icons = { success: Check, error: AlertCircle, info: Info }
const toneCls: Record<Tone, string> = {
  success: 'bg-success-subtle text-success', error: 'bg-danger-subtle text-danger', info: 'bg-info-subtle text-info',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const dismiss = (id: number) => setItems((l) => l.filter((t) => t.id !== id))

  const push = useCallback((message: string, tone: Tone = 'info') => {
    const id = ++seq
    setItems((l) => [...l, { id, tone, message }])
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), tone === 'error' ? 7000 : 4000)
  }, [])

  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:left-auto sm:right-5 sm:bottom-5 sm:w-[360px]">
        {items.map((t) => {
          const Icon = icons[t.tone]
          return (
            <div
              key={t.id}
              role={t.tone === 'error' ? 'alert' : 'status'}
              className="animate-toast pointer-events-auto flex w-full items-start gap-3 rounded-card border border-border-subtle bg-surface-elevated p-3 shadow-pop"
            >
              <span aria-hidden className={cn('mt-px grid h-6 w-6 shrink-0 place-items-center rounded-full', toneCls[t.tone])}><Icon size={13} strokeWidth={2.5} /></span>
              <p className="flex-1 pt-0.5 text-[13.5px] leading-snug">{t.message}</p>
              <IconButton label="Dismiss notification" onClick={() => dismiss(t.id)} className="-my-1 -mr-1 h-7 w-7"><X size={14} /></IconButton>
            </div>
          )
        })}
      </div>
    </Ctx.Provider>
  )
}

export const useToast = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('useToast outside ToastProvider')
  return c
}
