import { formatDate, REVIEWER_ROLE_LABELS, CRITERIA_LABELS } from "@/lib/utils"
import { StarRating } from "./StarRating"
import { Badge } from "@/components/ui/Badge"

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
}

export function ReviewCard({ review, showItem, itemTitle, itemId }: ReviewCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          {review.reviewer.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={review.reviewer.image}
              alt={review.reviewer.name ?? "Reviewer"}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-duke-blue/10 flex items-center justify-center text-duke-blue font-semibold text-sm">
              {review.reviewer.name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {review.reviewer.name ?? "Anonymous"}
            </p>
            {review.reviewer.department && (
              <p className="text-xs text-gray-500">{review.reviewer.department}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="orange">
            {REVIEWER_ROLE_LABELS[review.role as keyof typeof REVIEWER_ROLE_LABELS]}
          </Badge>
          <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
        </div>
      </div>

      {showItem && itemTitle && itemId && (
        <div className="mb-3 pb-3 border-b border-gray-100">
          <a
            href={`/items/${itemId}`}
            className="text-sm text-duke-blue hover:underline font-medium"
          >
            {itemTitle}
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {CRITERIA_LABELS.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{label}</span>
            <StarRating
              value={review[key as keyof typeof review] as number}
              readOnly
              size="sm"
            />
          </div>
        ))}
      </div>

      {review.comment && (
        <blockquote className="border-l-2 border-duke-blue/30 pl-3 text-sm text-gray-600 italic">
          {review.comment}
        </blockquote>
      )}
    </div>
  )
}
