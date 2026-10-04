import { formatDate } from '../../lib/utils'

export function Timeline({ items }: { items: { id: string; text: string; at: string }[] }) {
  return (
    <ol className="relative space-y-4 border-l border-border pl-5">
      {items.map((i, n) => (
        <li key={i.id} className="relative">
          <span className={`absolute -left-[24px] top-[7px] h-2 w-2 rounded-full ring-4 ring-surface ${n === 0 ? 'bg-accent-solid' : 'bg-border-strong'}`} aria-hidden />
          <p className="text-[13.5px] leading-snug">{i.text}</p>
          <time dateTime={i.at} className="type-meta text-muted">{formatDate(i.at, true)}</time>
        </li>
      ))}
    </ol>
  )
}
