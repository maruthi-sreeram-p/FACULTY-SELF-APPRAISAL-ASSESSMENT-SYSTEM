import { useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3, Bell, ChevronRight, ChevronsLeft, ChevronsRight, FileText, FolderOpen, GraduationCap, LayoutDashboard, Settings, User, X,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { cadreLabel } from '../../data/scoring'
import { Avatar } from '../ui/Avatar'
import { IconButton } from '../ui/Button'
import { LoadingSkeleton } from '../ui/States'
import { cn } from '../../lib/utils'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/profile', label: 'My Profile', icon: User },
  { to: '/appraisals', label: 'My Appraisals', icon: FileText },
  { to: '/documents', label: 'Documents', icon: FolderOpen },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/notifications', label: 'Notifications', icon: Bell, divider: true },
  { to: '/settings', label: 'Settings', icon: Settings },
]

/** Tooltip shown only when the sidebar is collapsed to a rail (desktop). */
const Tip = ({ children }: { children: string }) => (
  <span role="tooltip" className="pointer-events-none absolute left-full z-50 ml-3 hidden translate-x-[-4px] whitespace-nowrap rounded-control border border-border-subtle bg-surface-elevated px-2.5 py-1.5 text-xs font-medium text-primary opacity-0 shadow-pop transition duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 lg:block">
    {children}
  </span>
)

export function Sidebar({ collapsed, onToggle, mobileOpen, onClose }: {
  collapsed: boolean; onToggle: () => void; mobileOpen: boolean; onClose: () => void
}) {
  const { profile, profileLoading, unread } = useApp()
  const loc = useLocation()
  const nav = useNavigate()
  const rail = collapsed // labels always show in the mobile drawer; rail styles are lg-only

  useEffect(onClose, [loc.pathname]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!mobileOpen) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', k)
    return () => document.removeEventListener('keydown', k)
  }, [mobileOpen, onClose])

  return (
    <>
      {mobileOpen && <div className="animate-fade fixed inset-0 z-30 bg-[var(--scrim)] lg:hidden" onClick={onClose} aria-hidden />}
      <aside
        id="app-sidebar"
        aria-label="Primary"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[280px] max-w-[85vw] flex-col border-r border-border-subtle bg-sidebar transition-[width,transform] duration-[250ms] ease-out',
          mobileOpen ? 'translate-x-0 shadow-pop' : '-translate-x-full lg:translate-x-0',
          rail ? 'lg:w-[72px]' : 'lg:w-[256px]',
        )}
      >
        {/* brand */}
        <div className={cn('flex h-14 shrink-0 items-center gap-2.5 px-4', rail && 'lg:justify-center lg:px-0')}>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-control bg-linear-to-br from-accent-solid to-accent-hover text-white shadow-xs">
            <GraduationCap size={17} aria-hidden />
          </span>
          <span className={cn('truncate text-[14.5px] font-semibold tracking-tight', rail && 'lg:hidden')}>Faculty Appraisal</span>
          <IconButton label="Close navigation" onClick={onClose} className="ml-auto lg:hidden"><X size={18} /></IconButton>
        </div>

        {/* faculty identity */}
        <div className="px-3 pb-3 pt-1">
          <button
            onClick={() => nav('/profile')}
            aria-label={profile ? `Open profile: ${profile.name}` : 'Open profile'}
            className={cn(
              'group relative flex w-full items-center gap-3 rounded-card border border-border-subtle bg-surface-muted/60 p-2.5 text-left transition duration-150 hover:border-border hover:bg-surface-muted',
              rail && 'lg:justify-center lg:p-1.5',
            )}
          >
            {profileLoading || !profile ? (
              <>
                <LoadingSkeleton className="h-10 w-10 shrink-0 rounded-full" />
                <span className={cn('flex-1 space-y-1.5', rail && 'lg:hidden')}><LoadingSkeleton className="h-3.5 w-3/4" /><LoadingSkeleton className="h-3 w-1/2" /></span>
              </>
            ) : (
              <>
                <Avatar name={profile.name} src={profile.avatarUrl} size="md" />
                <span className={cn('min-w-0 flex-1 leading-tight', rail && 'lg:hidden')}>
                  <span className="block truncate text-[13.5px] font-semibold">{profile.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-secondary">{cadreLabel(profile.cadre) || "—"}</span>
                  <span className="mt-0.5 line-clamp-2 type-meta text-muted">{profile.department?.label ?? ""}</span>
                </span>
                <ChevronRight size={15} aria-hidden className={cn('shrink-0 -translate-x-1 text-muted opacity-0 transition duration-150 group-hover:translate-x-0 group-hover:opacity-100', rail && 'lg:hidden')} />
                {rail && <Tip>{profile.name}</Tip>}
              </>
            )}
          </button>
        </div>

        {/* navigation */}
        <nav className="flex-1 px-3 max-lg:overflow-y-auto" aria-label="Main">
          <ul className="space-y-0.5">
            {NAV.map(({ to, label, icon: Icon, end, divider }) => (
              <li key={to} className={cn(divider && 'mt-2 border-t border-border-subtle pt-2')}>
                <NavLink
                  to={to} end={end} aria-label={label}
                  className={({ isActive }) => cn(
                    'group relative flex h-9 items-center gap-3 rounded-control px-2.5 text-[13.5px] transition-colors duration-150',
                    rail && 'lg:justify-center lg:px-0',
                    isActive ? 'bg-accent-subtle font-semibold text-primary' : 'font-medium text-secondary hover:bg-surface-muted hover:text-primary',
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <span aria-hidden className={cn('absolute -left-3 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-accent-solid transition-opacity duration-200', isActive ? 'opacity-100' : 'opacity-0')} />
                      <Icon size={17} aria-hidden className={cn('shrink-0 transition-colors duration-150', isActive ? 'text-accent' : 'text-muted group-hover:text-secondary')} />
                      <span className={cn('truncate', rail && 'lg:hidden')}>{label}</span>
                      {to === '/notifications' && unread > 0 && (
                        <span className={cn('ml-auto grid min-w-5 place-items-center rounded-full bg-accent-solid px-1.5 text-[11px] font-semibold leading-5 text-white',
                          rail && 'lg:absolute lg:right-2 lg:top-1 lg:ml-0 lg:min-w-4 lg:px-1 lg:text-[10px] lg:leading-4')}>
                          {unread}
                        </span>
                      )}
                      {rail && <Tip>{label}</Tip>}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden border-t border-border-subtle p-3 lg:block">
          <button
            onClick={onToggle}
            aria-label={rail ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!rail}
            className={cn('group relative flex h-9 w-full items-center gap-3 rounded-control px-2.5 text-[13px] font-medium text-secondary transition-colors duration-150 hover:bg-surface-muted hover:text-primary', rail && 'justify-center px-0')}
          >
            {rail ? <ChevronsRight size={17} aria-hidden /> : <><ChevronsLeft size={17} aria-hidden /><span>Collapse</span></>}
            {rail && <Tip>Expand sidebar</Tip>}
          </button>
        </div>
      </aside>
    </>
  )
}
