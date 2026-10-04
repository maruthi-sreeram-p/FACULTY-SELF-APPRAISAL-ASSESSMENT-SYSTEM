import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { AppraisalStatus } from '../contract/dto'
import { services } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import { formatDate } from '../lib/utils'
import { DataTable } from '../components/tables/DataTable'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusBadge } from '../components/ui/StatusBadge'
import { EmptyState, ErrorState, TableSkeleton } from '../components/ui/States'

interface Row { year: string; status: AppraisalStatus; completion: number; updatedAt: string | null }

export default function Appraisals() {
  const q = useAsync(() => services.appraisals(), [])
  const { setYear, years } = useApp()
  const nav = useNavigate()
  const open = (y: string) => { setYear(y); nav(`/appraisals/${y}/step/general`) }

  // One row per academic year; a year without an appraisal is NOT_STARTED.
  const rows = useMemo<Row[]>(() => years.map((y) => {
    const a = q.data?.find((x) => x.academicYear === y)
    const p = a?.progress
    return {
      year: y, status: a?.status ?? 'NOT_STARTED', updatedAt: a?.updatedAt ?? null,
      completion: p && p.totalSections ? Math.round((p.completedSections / p.totalSections) * 100) : 0,
    }
  }), [q.data, years])

  return (
    <>
      <PageHeader title="My Appraisals" description="Open an academic year to continue or review your self-appraisal." />
      <Card pad="none">
        {q.loading ? <TableSkeleton rows={3} />
          : q.error ? <ErrorState message={q.error} onRetry={q.reload} />
          : !rows.length ? <EmptyState icon={<FileText size={22} />} title="No academic years yet" description="Academic years appear here once they are set up." />
          : (
            <div className="p-3 sm:p-0">
              <DataTable
                caption="Appraisals by academic year" rows={rows} rowKey={(r) => r.year}
                columns={[
                  { key: 'year', header: 'Academic year', render: (r) => <span className="font-medium tabular-nums">{r.year}</span> },
                  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
                  { key: 'completion', header: 'Completion', align: 'right', render: (r) => `${r.completion}%` },
                  { key: 'updated', header: 'Last updated', render: (r) => <span className="text-secondary">{formatDate(r.updatedAt)}</span> },
                ]}
                actions={(r) => (
                  <Button size="sm" variant={r.status === 'NOT_STARTED' || r.status === 'DRAFT' ? 'primary' : 'secondary'} onClick={() => open(r.year)}>
                    {r.status === 'NOT_STARTED' ? 'Start' : r.status === 'DRAFT' ? 'Continue' : 'View'}
                  </Button>
                )}
              />
            </div>
          )}
      </Card>
    </>
  )
}
