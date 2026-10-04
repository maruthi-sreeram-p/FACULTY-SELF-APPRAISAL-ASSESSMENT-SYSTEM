import { Bell, CalendarDays, ChevronDown, Menu, Moon, Sun } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useTheme } from '../../context/ThemeContext'
import { STEPS } from '../../data/appraisalSchema'
import { Breadcrumb, type Crumb } from '../ui/Breadcrumb'
import { IconButton } from '../ui/Button'
import { ProfileMenu } from './ProfileMenu'

const TITLES: Record<string, string> = {
  profile: 'My Profile', appraisals: 'My Appraisals', documents: 'Documents',
  reports: 'Reports', notifications: 'Notifications', settings: 'Settings',
}

function crumbs(path: string, year: string): Crumb[] {
  const parts = path.split('/').filter(Boolean)
  if (parts.length === 0) return [{ label: 'Dashboard' }]
  const base: Crumb[] = [{ label: 'Home', to: '/' }]
  if (parts[0] === 'appraisals' && parts[2] === 'step') {
    const step = STEPS.find((s) => s.id === parts[3])
    return [...base, { label: 'My Appraisals', to: '/appraisals' }, { label: parts[1] || year }, { label: step?.title ?? 'Step' }]
  }
  return [...base, { label: TITLES[parts[0]] ?? 'Not found' }]
}

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const { year, setYear, years, unread } = useApp()
  const { theme, toggle } = useTheme()
  const loc = useLocation()
  const nav = useNavigate()

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border-subtle bg-background/80 px-4 backdrop-blur-md sm:gap-3 sm:px-6 lg:px-8">
      <IconButton label="Open navigation" onClick={onMenu} aria-controls="app-sidebar" className="-ml-1.5 lg:hidden"><Menu size={19} /></IconButton>
      <div className="min-w-0 flex-1 overflow-hidden"><Breadcrumb items={crumbs(loc.pathname, year)} /></div>

      {/* Academic year: the context every year-scoped screen reads from */}
      <label className="group relative flex h-control shrink-0 items-center gap-2.5 rounded-control border border-border bg-surface pl-2 pr-8 shadow-xs transition-[border-color,box-shadow] duration-150 focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/15 hover:border-border-strong">
        <span aria-hidden className="grid h-6 w-6 place-items-center rounded-md bg-accent-subtle text-accent"><CalendarDays size={14} /></span>
        <span className="flex flex-col leading-none">
          <span className="type-eyebrow mb-[3px] text-muted max-sm:hidden">Academic year</span>
          <select
            aria-label="Academic year" value={year}
            onChange={(e) => {
              const y = e.target.value
              const m = loc.pathname.match(/^\/appraisals\/[^/]+\/step\/(.+)$/)
              setYear(y)
              if (m) nav(`/appraisals/${y}/step/${m[1]}`)
            }}
            className="cursor-pointer appearance-none bg-transparent pr-1 text-[13px] font-semibold tabular-nums text-primary focus:outline-none [&>option]:bg-surface [&>option]:text-primary"
          >
            {years.map((y) => <option key={y}>{y}</option>)}
          </select>
        </span>
        <ChevronDown size={14} aria-hidden className="pointer-events-none absolute right-2.5 text-muted transition-transform duration-150 group-hover:text-secondary" />
      </label>

      <div className="flex items-center gap-0.5">
        <Link to="/notifications" aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'} title="Notifications"
          className="relative grid h-8 w-8 place-items-center rounded-control text-secondary transition duration-150 hover:bg-surface-muted hover:text-primary active:scale-95">
          <Bell size={17} />
          {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-solid ring-2 ring-background" aria-hidden />}
        </Link>
        <IconButton label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} onClick={toggle}>
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </IconButton>
      </div>
      <span aria-hidden className="mx-0.5 hidden h-5 w-px bg-border sm:block" />
      <ProfileMenu />
    </header>
  )
}
