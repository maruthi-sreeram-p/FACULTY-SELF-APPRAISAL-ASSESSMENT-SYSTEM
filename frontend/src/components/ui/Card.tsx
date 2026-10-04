import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

/**
 * Card language
 *  default   – border + hairline shadow (most content)
 *  flat      – border only, quieter (supporting content)
 *  elevated  – stronger shadow (menus, floating panels)
 *  highlight – accent-tinted surface (the one primary card on a screen)
 *  interactive – default + hover lift (clickable cards)
 */
const variants = {
  default: 'border-border bg-surface shadow-card',
  flat: 'border-border-subtle bg-surface',
  elevated: 'border-border-subtle bg-surface-elevated shadow-pop',
  highlight: 'border-accent/25 bg-linear-to-br from-accent-subtle via-surface to-surface shadow-card',
  interactive: 'border-border bg-surface shadow-card transition duration-200 hover:border-border-strong hover:shadow-pop',
}
const pads = { none: '', sm: 'p-4', md: 'p-5 sm:p-6' }

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants
  pad?: keyof typeof pads
  /** @deprecated use variant="interactive" */
  hover?: boolean
}

export function Card({ className, variant = 'default', pad = 'md', hover, ...rest }: CardProps) {
  return (
    <div
      className={cn('rounded-card border', variants[hover ? 'interactive' : variant], pads[pad], className)}
      {...rest}
    />
  )
}
