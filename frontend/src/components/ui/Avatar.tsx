import { useState } from 'react'
import { cn, initials } from '../../lib/utils'

const sizes = { sm: 'h-8 w-8 text-[11px]', md: 'h-10 w-10 text-[13px]', lg: 'h-16 w-16 text-lg', xl: 'h-24 w-24 text-2xl' }

export function Avatar({ name, src, size = 'md', className }: {
  name: string; src?: string | null; size?: keyof typeof sizes; className?: string
}) {
  const [broken, setBroken] = useState(false)
  const base = cn('inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold ring-1 ring-border', sizes[size], className)
  if (src && !broken) {
    return <img src={src} alt={name} onError={() => setBroken(true)} className={cn(base, 'object-cover')} />
  }
  return (
    <span role="img" aria-label={name} className={cn(base, 'bg-linear-to-br from-accent-solid to-accent-hover tracking-wide text-white')}>
      {initials(name) || '?'}
    </span>
  )
}
