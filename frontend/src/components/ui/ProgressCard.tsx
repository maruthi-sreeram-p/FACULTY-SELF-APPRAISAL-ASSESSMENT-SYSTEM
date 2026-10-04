import { useEffect, useId, useState } from 'react'
import { Card } from './Card'

/** Thin animated ring. `value` is a 0–100 display value supplied by the caller. */
export function ProgressRing({ value, size = 96, stroke = 7, label }: { value: number; size?: number; stroke?: number; label: string }) {
  const [shown, setShown] = useState(0)
  const gid = useId()
  useEffect(() => { const t = requestAnimationFrame(() => setShown(value)); return () => cancelAnimationFrame(t) }, [value])
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent-solid)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - shown / 100)}
          style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(.2,.7,.2,1)' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-baseline justify-center pt-[34%] text-xl font-semibold tabular-nums tracking-tight">
        {value}<span className="text-xs font-medium text-muted">%</span>
      </span>
    </div>
  )
}

export function ProgressCard({ label, value, caption }: { label: string; value: number; caption?: string }) {
  return (
    <Card variant="flat" pad="sm" className="sm:p-5">
      <p className="type-label text-secondary">{label}</p>
      <div className="mt-3 flex items-center gap-4">
        <ProgressRing value={value} size={72} stroke={6} label={label} />
        {caption && <p className="type-meta text-muted">{caption}</p>}
      </div>
    </Card>
  )
}
