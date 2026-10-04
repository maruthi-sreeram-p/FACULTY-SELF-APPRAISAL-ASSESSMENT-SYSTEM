import { Hourglass } from 'lucide-react'
import type { OfficialReview as Review } from '../../types'
import { formatDate } from '../../lib/utils'
import { Card } from '../ui/Card'

const LABEL = {
  hod: { remarks: 'Recommendations of HoD', signer: 'Head of the Department', empty: 'No recommendation has been recorded yet.' },
  principal: { remarks: 'Remarks of the Principal', signer: 'Principal', empty: 'No remarks have been recorded yet.' },
}

/**
 * Read-only view of the HoD recommendation / Principal remarks box and its
 * "(Signature with Seal & Date)" line. Faculty cannot edit these; values come from the backend.
 */
export function OfficialReview({ kind, review }: { kind: 'hod' | 'principal'; review?: Review | null }) {
  const l = LABEL[kind]
  return (
    <Card pad="none">
      <div className="border-b border-border-subtle px-5 py-4 sm:px-6">
        <h2 className="type-section">{l.remarks}</h2>
      </div>
      <div className="space-y-5 p-5 sm:p-6">
        {review?.remarks ? (
          <p className="min-h-24 whitespace-pre-wrap rounded-card border border-border-subtle bg-surface-muted/50 p-4 text-[13.5px] leading-relaxed">{review.remarks}</p>
        ) : (
          <div className="flex min-h-24 items-center gap-3 rounded-card border border-dashed border-border-strong bg-surface-muted/40 p-4 text-[13.5px] text-secondary">
            <Hourglass size={16} aria-hidden className="shrink-0 text-muted" />
            {l.empty}
          </div>
        )}
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="type-label text-secondary">{l.signer} (Signature with Seal &amp; Date)</dt>
            <dd className="mt-1 text-[13.5px] font-medium">{review?.signedBy || <span className="font-normal text-muted">Awaiting</span>}</dd>
          </div>
          <div>
            <dt className="type-label text-secondary">Date</dt>
            <dd className="mt-1 text-[13.5px] font-medium">{review?.signedAt ? formatDate(review.signedAt) : <span className="font-normal text-muted">Awaiting</span>}</dd>
          </div>
        </dl>
      </div>
    </Card>
  )
}
