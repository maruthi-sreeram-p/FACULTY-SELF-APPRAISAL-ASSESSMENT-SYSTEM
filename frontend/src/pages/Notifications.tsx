import { Bell } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { errorMessage, services } from '../lib/api'
import { cn, formatDate } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/States'

export default function Notifications() {
  const { notifications, unread, refreshNotifications } = useApp()
  const toast = useToast()
  const markAll = async () => {
    try { await services.markAllRead(); refreshNotifications() } catch (e) { toast(errorMessage(e), 'error') }
  }
  return (
    <>
      <PageHeader title="Notifications" description={unread ? `${unread} unread` : 'Updates about your appraisals.'}
        actions={<Button variant="secondary" size="sm" disabled={!unread} onClick={markAll}>Mark all as read</Button>} />
      <Card pad="none">
        {notifications.length === 0 ? <EmptyState icon={<Bell size={22} />} title="You're all caught up" description="Reminders and status updates about your appraisal will appear here." /> : (
          <ul className="divide-y divide-border-subtle">
            {notifications.map((n) => (
              <li key={n.id} className={cn('flex gap-3.5 px-5 py-4 transition-colors duration-300', !n.read && 'bg-accent-subtle/40')}>
                <span className={cn('mt-[7px] h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-transparent ring-1 ring-border-strong' : 'bg-accent-solid')} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className={cn('text-[13.5px]', n.read ? 'font-medium text-secondary' : 'font-semibold')}>{n.title}{!n.read && <span className="sr-only"> (unread)</span>}</p>
                  <p className="mt-0.5 text-[13.5px] text-secondary">{n.body}</p>
                  <time dateTime={n.createdAt} className="type-meta mt-1 block text-muted">{formatDate(n.createdAt, true)}</time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}
