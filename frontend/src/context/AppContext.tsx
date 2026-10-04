import { createContext, useContext, useState, type ReactNode } from 'react'
import { ACADEMIC_YEARS } from '../data/appraisalSchema'
import { services } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import type { NotificationItem, Profile } from '../types'

interface AppCtx {
  profile: Profile | null
  profileLoading: boolean
  year: string
  setYear: (y: string) => void
  years: string[]
  notifications: NotificationItem[]
  unread: number
  refreshNotifications: () => void
}

const Ctx = createContext<AppCtx | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const profile = useAsync(() => services.profile(), [])
  const notes = useAsync(() => services.notifications(), [])
  const [year, setYear] = useState(ACADEMIC_YEARS[0])
  const list = notes.data ?? []

  return (
    <Ctx.Provider value={{
      profile: profile.data, profileLoading: profile.loading, year, setYear, years: ACADEMIC_YEARS,
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
