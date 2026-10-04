import { useCallback, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

const KEY = 'sidebar-collapsed'

export function AppShell() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(KEY) === '1' } catch { return false }
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const loc = useLocation()
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  const toggle = () => setCollapsed((c) => {
    try { localStorage.setItem(KEY, c ? '0' : '1') } catch { /* ignore */ }
    return !c
  })

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only z-[70] rounded-control bg-accent-solid px-3 py-2 text-accent-fg focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Skip to content
      </a>
      <Sidebar collapsed={collapsed} onToggle={toggle} mobileOpen={mobileOpen} onClose={closeMobile} />
      <div className={cn('min-w-0 transition-[padding] duration-[250ms] ease-out', collapsed ? 'lg:pl-[72px]' : 'lg:pl-[256px]')}>
        <TopBar onMenu={() => setMobileOpen(true)} />
        <main id="main" tabIndex={-1} className="mx-auto max-w-[1200px] px-4 pb-16 pt-6 outline-none sm:px-6 sm:pt-8 lg:px-8">
          <div key={loc.pathname} className="animate-page"><Outlet /></div>
        </main>
      </div>
    </div>
  )
}
