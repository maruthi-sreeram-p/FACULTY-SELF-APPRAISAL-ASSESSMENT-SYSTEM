import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/States'

export default function NotFound() {
  return (
    <Card pad="none">
      <EmptyState icon={<Compass size={22} />} title="Page not found" description="The page you are looking for does not exist or has moved."
        action={<Link to="/" className="inline-flex h-control items-center rounded-control bg-accent-solid px-4 text-[13.5px] font-medium text-accent-fg shadow-xs transition duration-150 hover:bg-accent-hover">Back to dashboard</Link>} />
    </Card>
  )
}
