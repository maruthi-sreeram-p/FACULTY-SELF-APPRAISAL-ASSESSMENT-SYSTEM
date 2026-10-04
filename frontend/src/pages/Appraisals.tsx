import { useNavigate } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { services } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import { formatDate } from '../lib/utils'
import { DataTable } from '../components/tables/DataTable'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusBadge } from '../components/ui/StatusBadge'
import { EmptyState, ErrorState, TableSkeleton } from '../components/ui/States'

export default function Appraisals() {
  const q = useAsync(() => services.appraisals(), [])
  const { setYear } = useApp()
  const nav = useNavigate()
  const open = (y: string) => { setYear(y); nav(`/appraisals/${y}/step/general`) }

  return (
    <>
      <PageHeader title="My Appraisals" description="Open an academic year to continue or review your self-appraisal." />
      <Card pad="none">
        {q.loading ? <TableSkeleton rows={3} />
          : q.error ? <ErrorState message={q.error} onRetry={q.reload} />
          : !q.data?.length ? <EmptyState icon={<FileText size={22} />} title="No appraisals yet" description="Your appraisal for the current academic year will appear here once it opens." />
          : (
            <div className="p-3 sm:p-0">
              <DataTable
                caption="Appraisals by academic year" rows={q.data} rowKey={(r) => r.year}
                columns={[
                  { key: 'year', header: 'Academic year', render: (r) => <span className="font-medium tabular-nums">{r.year}</span> },
                  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
                  { key: 'completion', header: 'Completion', align: 'right', render: (r) => `${r.completion}%` },
                  { key: 'updated', header: 'Last updated', render: (r) => <span className="text-secondary">{formatDate(r.updatedAt)}</span> },
                ]}
                actions={(r) => (
                  <Button size="sm" variant={r.status === 'not_started' || r.status === 'draft' ? 'primary' : 'secondary'} onClick={() => open(r.year)}>
                    {r.status === 'not_started' ? 'Start' : r.status === 'draft' ? 'Continue' : 'View'}
                  </Button>
                )}
              />
            </div>
          )}
      </Card>
    </>
  )
}
