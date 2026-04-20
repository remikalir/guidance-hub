import Link from "next/link"
import { ItemType } from "@prisma/client"
import { formatDate, computeOverallAverage, CRITERIA_LABELS, GUIDANCE_TYPES } from "@/lib/utils"
import { ItemTypeBadge } from "./ItemTypeBadge"
import { StarRating } from "@/components/reviews/StarRating"

interface ItemCardProps {
  item: {
    id: string
    title: string
    description: string
    type: ItemType
    createdAt: Date | string
    author: { id: string; name: string | null; image: string | null }
    tags: { name: string }[]
    _count: { reviews: number }
    aggregates?: {
      _avg: {
        studentAgency: number | null
        biasMitigation: number | null
        dataSecurity: number | null
        accessibility: number | null
        studentLearning: number | null
      }
    }
  }
}

export function ItemCard({ item }: ItemCardProps) {
  const overall =
    item.aggregates
      ? computeOverallAverage({
          studentAgency: item.aggregates._avg.studentAgency,
          biasMitigation: item.aggregates._avg.biasMitigation,
          dataSecurity: item.aggregates._avg.dataSecurity,
          accessibility: item.aggregates._avg.accessibility,
          studentLearning: item.aggregates._avg.studentLearning,
        })
      : null

  // Strip HTML tags for preview
  const descriptionPreview = item.description
    .replace(/<[^>]+>/g, "")
    .slice(0, 120)

  return (
    <Link href={`/items/${item.id}`} className="block group">
      <article className="bg-white border border-gray-200 rounded-xl p-5 h-full hover:shadow-md hover:border-duke-blue/30 transition-all">
        <div className="flex items-start justify-between gap-2 mb-3">
          <ItemTypeBadge type={item.type} />
          {overall !== null && (
            <div className="flex items-center gap-1 shrink-0">
              <StarRating value={Math.round(overall)} readOnly size="sm" />
              <span className="text-xs text-gray-500">
                {overall.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <h2 className="text-base font-semibold text-gray-900 group-hover:text-duke-blue transition-colors line-clamp-2 mb-2">
          {item.title}
        </h2>

        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {descriptionPreview}
          {item.description.replace(/<[^>]+>/g, "").length > 120 ? "..." : ""}
        </p>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 4).map((tag) => (
              <span
                key={tag.name}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
              >
                {tag.name}
              </span>
            ))}
            {item.tags.length > 4 && (
              <span className="px-2 py-0.5 text-gray-400 text-xs">
                +{item.tags.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {item.author.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.author.image}
                alt={item.author.name ?? ""}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-duke-blue/10 flex items-center justify-center text-[10px] font-semibold text-duke-blue">
                {item.author.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <span className="text-xs text-gray-500 truncate max-w-[100px]">
              {item.author.name ?? "Anonymous"}
            </span>
          </div>
          {!(GUIDANCE_TYPES as string[]).includes(item.type) && (
            <span className="text-xs text-gray-400">
              {item._count.reviews} {item._count.reviews === 1 ? "review" : "reviews"}
            </span>
          )}
        </div>
      </article>
    </Link>
  )
}
