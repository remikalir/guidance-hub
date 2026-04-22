// src/components/reviews/ReviewCard.tsx — Phase 4c: + hideReviewer / itemType props
import {
  formatDate,
  REVIEWER_ROLE_LABELS,
  CRITERIA_LABELS,
  ITEM_TYPE_LABELS,
} from "@/lib/utils"
import { StarRating } from "./StarRating"
import type { ItemType } from "@prisma/client"

interface ReviewCardProps {
  review: {
    id: string
    role: string
    studentAgency: number
    biasMitigation: number
    dataSecurity: number
    accessibility: number
    studentLearning: number
    comment: string | null
    createdAt: Date | string
    reviewer: {
      id: string
      name: string | null
      image: string | null
      department?: string | null
    }
  }
  showItem?: boolean
  itemTitle?: string
  itemId?: string
  itemType?: ItemType
  /**
   * When true, the reviewer header (avatar + name + department) is suppressed
   * and the reviewed item takes the top-left slot instead. Used on profile
   * pages where every review in the list is by the same person.
   */
  hideReviewer?: boolean
}

export function ReviewCard({
  review,
  showItem,
  itemTitle,
  itemId,
  itemType,
  hideReviewer,
}: ReviewCardProps) {
  const roleLabel =
    REVIEWER_ROLE_LABELS[review.role as keyof typeof REVIEWER_ROLE_LABELS]

  const showItemAsHeader = hideReviewer && itemTitle && itemId

  return (
    <div className="bg-white border border-rule rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        {showItemAsHeader ? (
          /* Profile-context header: reviewed item is the focus */
          <div className="min-w-0 flex-1">
            <a
              href={`/items/${itemId}`}
              className="font-serif text-[18px] text-duke-blue hover:underline leading-tight block mb-1"
            >
              {itemTitle}
            </a>
            {itemType && (
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                {ITEM_TYPE_LABELS[itemType] ?? itemType}
              </p>
            )}
          </div>
        ) : (
          /* Detail-context header: reviewer is the focus */
          <div className="flex items-center gap-3">
            {review.reviewer.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={review.reviewer.image}
                alt=""
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-duke-blue text-white flex items-center justify-center font-medium text-[13px]">
                {review.reviewer.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <div>
              <p className="text-[14px] font-medium text-ink leading-tight">
                {review.reviewer.name ?? "Anonymous"}
              </p>
              {review.reviewer.department && (
                <p className="text-[12px] text-muted mt-0.5">
                  {review.reviewer.department}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted border border-rule rounded-full px-2 py-0.5 bg-cream">
            {roleLabel}
          </span>
          <span className="text-[11px] text-muted">
            {formatDate(review.createdAt)}
          </span>
        </div>
      </div>

      {/* Item link (fallback for when showItem is passed but hideReviewer is not —
          preserves prior behavior for any caller that doesn't opt into hideReviewer) */}
      {!hideReviewer && showItem && itemTitle && itemId && (
        <div className="mb-4 pb-4 border-b border-rule">
          <a
            href={`/items/${itemId}`}
            className="text-[13px] text-duke-blue hover:underline font-medium"
          >
            {itemTitle}
          </a>
        </div>
      )}

      {/* Per-criterion ratings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-5">
        {CRITERIA_LABELS.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between gap-3">
            <span className="text-[12px] text-muted">{label}</span>
            <StarRating
              value={review[key as keyof typeof review] as number}
              readOnly
              size="sm"
            />
          </div>
        ))}
      </div>

      {/* Comment */}
      {review.comment && (
        <blockquote className="border-l-2 border-rule pl-4 text-[14px] text-ink italic leading-relaxed">
          {review.comment}
        </blockquote>
      )}
    </div>
  )
}
