import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatDate, ITEM_TYPE_LABELS, GUIDANCE_TYPES } from "@/lib/utils"
import { ItemTypeBadge } from "@/components/items/ItemTypeBadge"
import { ItemAdminControls } from "@/components/items/ItemAdminControls"
import { ScoreSummary } from "@/components/reviews/ScoreSummary"
import { ReviewCard } from "@/components/reviews/ReviewCard"
import { ReviewForm } from "@/components/reviews/ReviewForm"
import Link from "next/link"

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  const [item, reviews, aggregates] = await Promise.all([
    prisma.item.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            department: true,
            title: true,
          },
        },
        tags: { select: { name: true } },
      },
    }),
    prisma.review.findMany({
      where: { itemId: id },
      include: {
        reviewer: {
          select: { id: true, name: true, image: true, department: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.aggregate({
      where: { itemId: id },
      _avg: {
        studentAgency: true,
        biasMitigation: true,
        dataSecurity: true,
        accessibility: true,
        studentLearning: true,
      },
      _count: true,
    }),
  ])

  if (!item) notFound()

  const isGuidance = (GUIDANCE_TYPES as string[]).includes(item.type)
  const isAuthor = session?.user?.id === item.authorId
  const isCtlStaff = session?.user?.isCtlStaff === true

  // Unpublished items are visible only to the author and CTL staff.
  // Everyone else sees a 404 so URLs don't leak existence of hidden content.
  if (!item.published && !isAuthor && !isCtlStaff) notFound()

  const hasReviewed = session?.user?.id
    ? reviews.some((r) => r.reviewerId === session.user.id)
    : false

  // For community items, find related guidance items by shared tags
  const relatedGuidance = !isGuidance && item.tags.length > 0
    ? await prisma.item.findMany({
        where: {
          type: { in: GUIDANCE_TYPES },
          published: true,
          tags: { some: { name: { in: item.tags.map((t) => t.name) } } },
        },
        select: { id: true, title: true, type: true },
        take: 3,
      })
    : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Link href={isGuidance ? "/guidance" : "/"} className="text-sm text-gray-500 hover:text-duke-blue">
                {isGuidance ? "← Guidance" : "← Browse"}
              </Link>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <ItemTypeBadge type={item.type} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
              </div>
              {isAuthor && (
                <Link
                  href={`/items/${id}/edit`}
                  className="shrink-0 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:border-duke-blue hover:text-duke-blue transition-colors"
                >
                  Edit
                </Link>
              )}
            </div>

            {/* Author */}
            <div className="flex items-center gap-2 mt-3">
              {item.author.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.author.image}
                  alt={item.author.name ?? ""}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-duke-blue/10 flex items-center justify-center text-xs font-semibold text-duke-blue">
                  {item.author.name?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <Link
                href={`/profile/${item.author.id}`}
                className="text-sm font-medium text-gray-700 hover:text-duke-blue"
              >
                {item.author.name}
              </Link>
              {item.author.title && (
                <span className="text-xs text-gray-400">• {item.author.title}</span>
              )}
              {item.author.department && (
                <span className="text-xs text-gray-400">• {item.author.department}</span>
              )}
              <span className="text-xs text-gray-400 ml-auto">
                {formatDate(item.createdAt)}
              </span>
            </div>
          </div>

          {/* Unpublished banner — visible only to author/CTL staff who can see this item */}
          {!item.published && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
              <p className="font-semibold text-red-800">This item is unpublished.</p>
              <p className="text-red-700 text-xs mt-1">
                Only the author and CTL staff can see this page. It does not appear in browse results.
              </p>
            </div>
          )}

          {/* Description */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: item.description }}
            />
          </div>

          {/* Links & file */}
          {(item.externalLink || item.fileUrl) && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-2">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">
                Attachments &amp; Links
              </h3>
              {item.externalLink && (
                <a
                  href={item.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-duke-blue hover:underline"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {item.externalLink}
                </a>
              )}
              {item.fileUrl && (
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-duke-blue hover:underline"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Attachment
                </a>
              )}
            </div>
          )}

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <Link
                  key={tag.name}
                  href={`/?tags=${tag.name}`}
                  className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-duke-blue/10 hover:text-duke-blue transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Reviews (community items only) */}
          {!isGuidance && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Reviews ({reviews.length})
              </h2>

              {session?.user ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {hasReviewed ? "Your Review" : "Write a Review"}
                  </h3>
                  <ReviewForm itemId={id} hasReviewed={hasReviewed} />
                </div>
              ) : (
                <div className="bg-duke-blue/5 border border-duke-blue/20 rounded-xl p-5 mb-6 text-center">
                  <p className="text-sm text-gray-600">
                    <Link href="/signin" className="text-duke-blue font-medium hover:underline">
                      Sign in with your Duke account
                    </Link>{" "}
                    to leave a review.
                  </p>
                </div>
              )}

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  No reviews yet.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Score summary — community items only */}
          {!isGuidance && (
            <ScoreSummary
              averages={{
                studentAgency: aggregates._avg.studentAgency,
                biasMitigation: aggregates._avg.biasMitigation,
                dataSecurity: aggregates._avg.dataSecurity,
                accessibility: aggregates._avg.accessibility,
                studentLearning: aggregates._avg.studentLearning,
              }}
              reviewCount={aggregates._count}
            />
          )}

          {/* CTL Curated badge — for CTL-authored guidance content */}
          {item.ctlCurated && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-orange-800">CTL Curated</span>
              </div>
              <p className="text-xs text-orange-700">
                This content has been vetted and published by the Duke Center for Teaching &amp; Learning.
              </p>
            </div>
          )}

          {/* CTL Endorsed badge — for community-submitted items recognized by CTL */}
          {item.ctlEndorsed && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-green-800">CTL Endorsed</span>
              </div>
              <p className="text-xs text-green-700">
                Recognized by the Duke Center for Teaching &amp; Learning as a valuable contribution from the community.
              </p>
            </div>
          )}

          {/* CTL staff admin controls */}
          {isCtlStaff && (
            <ItemAdminControls
              itemId={item.id}
              itemType={item.type}
              published={item.published}
              ctlCurated={item.ctlCurated}
              ctlEndorsed={item.ctlEndorsed}
            />
          )}

          <div className="bg-white border border-gray-200 rounded-xl p-5 text-sm text-gray-600 space-y-2">
            <p>
              <span className="font-medium text-gray-900">Type:</span>{" "}
              {ITEM_TYPE_LABELS[item.type]}
            </p>
            <p>
              <span className="font-medium text-gray-900">Submitted:</span>{" "}
              {formatDate(item.createdAt)}
            </p>
            {item.updatedAt !== item.createdAt && (
              <p>
                <span className="font-medium text-gray-900">Updated:</span>{" "}
                {formatDate(item.updatedAt)}
              </p>
            )}
            {isGuidance && item.lastReviewedAt && (
              <p>
                <span className="font-medium text-gray-900">Last Reviewed:</span>{" "}
                {formatDate(item.lastReviewedAt)}
              </p>
            )}
          </div>

          {/* Related CTL Guidance — community items only */}
          {!isGuidance && relatedGuidance.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Related CTL Guidance</h3>
              <ul className="space-y-2">
                {relatedGuidance.map((g) => (
                  <li key={g.id}>
                    <Link
                      href={`/items/${g.id}`}
                      className="text-sm text-duke-blue hover:underline"
                    >
                      {g.title}
                    </Link>
                    <span className="text-xs text-gray-400 ml-1">
                      — {ITEM_TYPE_LABELS[g.type]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
