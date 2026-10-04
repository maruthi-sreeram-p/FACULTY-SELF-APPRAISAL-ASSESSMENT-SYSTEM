import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { Avatar } from '../ui/Avatar'

export function ProfileMenu() {
  const { profile } = useApp()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const nav = useNavigate()
  const toast = useToast()

  useEffect(() => {
    if (!open) return
    const items = () => Array.from(ref.current?.querySelectorAll<HTMLElement>('[role=menuitem]') ?? [])
    items()[0]?.focus()
    const click = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); trigger.current?.focus() }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const list = items()
        const i = list.indexOf(document.activeElement as HTMLElement)
        list[(i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length]?.focus()
      }
      if (e.key === 'Tab') setOpen(false)
    }
    document.addEventListener('mousedown', click)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', click); document.removeEventListener('keydown', key) }
  }, [open])

  if (!profile) return <span className="skeleton h-8 w-8 rounded-full" aria-hidden />

  const go = (to: string) => { setOpen(false); nav(to) }
  const item = 'flex w-full items-center gap-2.5 rounded-control px-2.5 py-2 text-left text-[13.5px] text-secondary transition-colors duration-150 hover:bg-surface-muted hover:text-primary focus-visible:bg-surface-muted focus-visible:outline-none'

  return (
    <div ref={ref} className="relative">
      <button ref={trigger} onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label="Account menu"
        className="flex items-center gap-1 rounded-full p-0.5 pr-1.5 transition-colors duration-150 hover:bg-surface-muted">
        <Avatar name={profile.name} src={profile.avatarUrl} size="sm" />
        <ChevronDown size={13} className="text-muted" aria-hidden />
      </button>
      {open && (
        <div role="menu" aria-label="Account" className="animate-menu absolute right-0 top-full z-40 mt-2 w-64 rounded-card border border-border-subtle bg-surface-elevated p-1.5 shadow-pop">
          <div className="flex items-center gap-3 px-2.5 py-2.5">
            <Avatar name={profile.name} src={profile.avatarUrl} size="md" />
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-semibold">{profile.name}</p>
              <p className="truncate type-meta text-muted">{profile.email}</p>
            </div>
          </div>
          <hr className="my-1 border-border-subtle" />
          <button role="menuitem" className={item} onClick={() => go('/profile')}><User size={16} aria-hidden /> View profile</button>
          <button role="menuitem" className={item} onClick={() => go('/settings')}><Settings size={16} aria-hidden /> Settings</button>
          <hr className="my-1 border-border-subtle" />
          <button role="menuitem" className={item} onClick={() => { setOpen(false); toast('Sign-out is handled by the authentication service, which is not connected yet.', 'info') }}>
            <LogOut size={16} aria-hidden /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}
