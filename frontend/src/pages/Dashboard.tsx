import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Clock, FolderOpen } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { services } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import { formatDate } from '../lib/utils'
import { ScoreCard } from '../components/appraisal/ScoreCard'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { ProgressRing } from '../components/ui/ProgressCard'
import { StatCard } from '../components/ui/StatCard'
import { StatusBadge } from '../components/ui/StatusBadge'
import { EmptyState, ErrorState, LoadingSkeleton } from '../components/ui/States'
import { Timeline } from '../components/ui/Timeline'

function DashboardSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-3" aria-busy="true" aria-label="Loading dashboard">
      <LoadingSkeleton className="h-48 rounded-card lg:col-span-2" />
      <LoadingSkeleton className="h-48 rounded-card" />
      <LoadingSkeleton className="h-72 rounded-card lg:col-span-2" />
      <div className="space-y-5"><LoadingSkeleton className="h-32 rounded-card" /><LoadingSkeleton className="h-36 rounded-card" /></div>
    </div>
  )
}

export default function Dashboard() {
  const { year, profile } = useApp()
  const nav = useNavigate()
  const q = useAsync(() => services.dashboard(year), [year])
  const d = q.data
  const editable = d && ['NOT_STARTED', 'DRAFT', 'RETURNED'].includes(d.status)
  const next = d?.pendingSections[0]
  const remaining = d?.pendingSections.length ?? 0

  return (
    <>
      <PageHeader
        eyebrow={`Academic year ${year}`}
        title={profile ? `Welcome back, ${profile.name}` : 'Welcome back'}
        description="Here is where your self-appraisal stands."
        actions={d && <StatusBadge status={d.status} className="px-2.5 py-1 text-[13px]" />}
      />

      {q.loading ? <DashboardSkeleton /> : q.error || !d ? <Card><ErrorState message={q.error ?? 'Unable to load'} onRetry={q.reload} /></Card> : (
        <div className="grid gap-5 lg:grid-cols-3">
          {/* PRIMARY: completion */}
          <Card variant="highlight" className="lg:col-span-2">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <ProgressRing value={d.completion} size={104} stroke={7} label="Appraisal completion" />
              <div className="min-w-0 flex-1">
                <h2 className="type-section text-base">Appraisal completion</h2>
                <p className="mt-1 text-sm text-secondary">
                  {remaining === 0 ? (d.status === 'NOT_STARTED' || d.status === 'DRAFT' ? 'All sections are complete.' : 'This appraisal has been submitted.') : `${remaining} ${remaining === 1 ? 'section' : 'sections'} remaining before you can submit.`}
                </p>
                {d.activity[0] && <p className="type-meta mt-1 flex items-center gap-1.5 text-muted"><Clock size={12} aria-hidden /> Last activity {formatDate(d.activity[0].at, true)}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button onClick={() => nav(`/appraisals/${year}/step/${editable && remaining === 0 ? 'review' : (next?.stepId ?? 'general')}`)}>
                    {editable ? (d.status === 'NOT_STARTED' ? 'Start appraisal' : remaining === 0 ? 'Review and submit' : 'Continue appraisal') : 'View appraisal'} <ArrowRight size={15} aria-hidden />
                  </Button>
                  {editable && next && <span className="text-[13px] text-secondary">Up next: <span className="font-medium text-primary">{next.title}</span></span>}
                </div>
              </div>
            </div>
          </Card>

          {/* SECONDARY: score */}
          <ScoreCard scoreSheet={d.scoreSheet} />

          {/* SUPPORTING: pending sections */}
          <Card pad="none" className="lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
              <h2 className="type-section">Pending sections</h2>
              {remaining > 0 && <span className="type-meta rounded-md bg-surface-muted px-2 py-0.5 font-medium text-secondary">{remaining} left</span>}
            </div>
            {remaining === 0 ? (
              <EmptyState icon={<CheckCircle2 size={22} />} title="Nothing pending" description="Every section is complete, or the appraisal has already been submitted." />
            ) : (
              <>
                <ul>
                  {d.pendingSections.slice(0, 6).map((s) => (
                    <li key={s.stepId} className="border-b border-border-subtle last:border-0">
                      <Link to={`/appraisals/${year}/step/${s.stepId}`} className="group flex items-center gap-3 px-5 py-3 text-[13.5px] transition-colors duration-150 hover:bg-surface-muted/70">
                        <span aria-hidden className="h-4 w-4 shrink-0 rounded-full border-2 border-border-strong" />
                        <span className="flex-1">{s.title}</span>
                        <ArrowRight size={14} aria-hidden className="-translate-x-1 text-muted opacity-0 transition duration-150 group-hover:translate-x-0 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border-subtle px-5 py-3 text-[13px]">
                  <Link to={`/appraisals/${year}/step/review`} className="font-medium text-accent hover:underline">
                    {remaining > 6 ? `View all ${remaining} sections` : 'Review all sections'}
                  </Link>
                </div>
              </>
            )}
          </Card>

          <div className="space-y-5">
            <StatCard label="Documents" icon={<FolderOpen size={15} />} value={d.documentCount}
              hint={`uploaded for ${d.year}`}
              footer={<Link to="/documents" className="font-medium text-accent hover:underline">Manage documents</Link>} />
            <Card variant="flat" pad="sm" className="sm:p-5">
              <h2 className="type-label mb-4 text-secondary">Recent activity</h2>
              {d.activity.length === 0
                ? <p className="text-[13px] text-muted">Nothing yet. Saving a draft or uploading a document will show up here.</p>
                : <Timeline items={d.activity.slice(0, 4)} />}
            </Card>
          </div>
        </div>
      )}
    </>
  )
}
