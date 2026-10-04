import { Building2, IdCard, Mail, Phone, UserRound } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { cadreLabel } from '../data/scoring'
import { Avatar } from '../components/ui/Avatar'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { LoadingSkeleton } from '../components/ui/States'

export default function Profile() {
  const { profile } = useApp()
  const cadre = profile ? cadreLabel(profile.cadre) : ''
  const rows = profile ? [
    { label: 'Employee ID', value: profile.employeeId, icon: IdCard },
    { label: 'Designation (Cadre)', value: cadre, icon: UserRound },
    { label: 'Department / Branch', value: profile.department?.label, icon: Building2 },
    { label: 'E-mail ID', value: profile.email, icon: Mail },
    { label: 'Contact No.', value: profile.contactNo, icon: Phone },
  ] : []

  return (
    <>
      <PageHeader title="My Profile" description="Your details as held in the institutional records. They prefill Part A of each appraisal." />
      <Card pad="none" className="max-w-3xl overflow-hidden">
        <div aria-hidden className="h-24 bg-linear-to-r from-accent-subtle via-surface-muted to-surface sm:h-28" />
        {!profile ? (
          <div className="space-y-4 p-6" aria-busy="true" aria-label="Loading profile">
            <LoadingSkeleton className="-mt-14 h-24 w-24 rounded-full" />
            <LoadingSkeleton className="h-5 w-1/3" />
            <LoadingSkeleton className="h-4 w-1/4" />
            <LoadingSkeleton className="mt-6 h-32" />
          </div>
        ) : (
          <div className="px-5 pb-6 sm:px-8">
            <span className="-mt-12 inline-block rounded-full bg-surface p-1 sm:-mt-14">
              <Avatar name={profile.name} src={profile.avatarUrl} size="xl" />
            </span>
            <h2 className="mt-3 text-xl font-semibold tracking-tight">{profile.name}</h2>
            <p className="text-sm text-secondary">{[cadre, profile.department?.label].filter(Boolean).join(' · ') || '—'}</p>

            <dl className="mt-6 divide-y divide-border-subtle rounded-card border border-border-subtle">
              {rows.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3 px-4 py-3 sm:gap-4">
                  <Icon size={16} aria-hidden className="shrink-0 text-muted" />
                  <dt className="w-32 shrink-0 text-[13px] text-secondary sm:w-44">{label}</dt>
                  <dd className="min-w-0 flex-1 truncate text-[13.5px] font-medium">{value || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </Card>
    </>
  )
}
