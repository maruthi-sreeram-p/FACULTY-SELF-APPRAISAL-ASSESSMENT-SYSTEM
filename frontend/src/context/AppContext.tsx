import { createContext, useContext, useState, type ReactNode } from 'react'
import type { FacultyProfileDto, NotificationDto } from '../contract/dto'
import { services } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import { ErrorState, LoadingSkeleton } from '../components/ui/States'

interface AppCtx {
  profile: FacultyProfileDto | null
  profileLoading: boolean
  year: string
  setYear: (y: string) => void
  years: string[]
  notifications: NotificationDto[]
  unread: number
  refreshNotifications: () => void
}

const Ctx = createContext<AppCtx | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const profile = useAsync(() => services.profile(), [])
  const notes = useAsync(() => services.notifications(), [])
  const yearsQ = useAsync(() => services.academicYears(), [])
  const [picked, setYear] = useState<string | null>(null)
  const list = notes.data ?? []

  if (yearsQ.error) return <div className="mx-auto max-w-md pt-24"><ErrorState message={yearsQ.error} onRetry={yearsQ.reload} /></div>
  if (!yearsQ.data) {
    return (
      <div className="mx-auto max-w-md space-y-3 px-6 pt-24" aria-busy="true" aria-label="Loading">
        <LoadingSkeleton className="h-6 w-1/2" /><LoadingSkeleton className="h-32 rounded-card" />
      </div>
    )
  }

  const labels = yearsQ.data.map((y) => y.label)
  const year = picked && labels.includes(picked) ? picked : (yearsQ.data.find((y) => y.current) ?? yearsQ.data[0])?.label ?? ''

  return (
    <Ctx.Provider value={{
      profile: profile.data, profileLoading: profile.loading, year, setYear, years: labels,
      notifications: list, unread: list.filter((n) => !n.read).length, refreshNotifications: notes.reload,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useApp = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('useApp outside AppProvider')
  return c
}
