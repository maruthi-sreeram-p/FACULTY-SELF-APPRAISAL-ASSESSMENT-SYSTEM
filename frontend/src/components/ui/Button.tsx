import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

const variants = {
  primary: 'bg-accent-solid text-accent-fg shadow-xs hover:bg-accent-hover',
  secondary: 'border border-border bg-surface text-primary shadow-xs hover:border-border-strong hover:bg-surface-muted',
  ghost: 'text-secondary hover:bg-surface-muted hover:text-primary',
  danger: 'bg-danger-solid text-white shadow-xs hover:brightness-110',
}
const sizes = { sm: 'h-control-sm px-3 text-[13px]', md: 'h-control px-4 text-[13.5px]' }

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control font-medium transition duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-50',
        variants[variant], sizes[size], className,
      )}
      {...rest}
    >
      {loading && <Loader2 size={15} className="animate-spin" aria-hidden />}
      {children}
    </button>
  )
}

/** Square icon-only button. `label` is required: it is the accessible name and the native tooltip. */
export function IconButton({ label, tone = 'default', className, children, type = 'button', ...rest }:
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> & { label: string; tone?: 'default' | 'danger'; children: ReactNode }) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-secondary transition duration-150 active:scale-95 disabled:opacity-50',
        tone === 'danger' ? 'hover:bg-danger-subtle hover:text-danger' : 'hover:bg-surface-muted hover:text-primary',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
