// src/app/items/[id]/page.tsx — Phase 4a + 4b: Item Detail Page
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatDate, ITEM_TYPE_LABELS, GUIDANCE_TYPES } from "@/lib/utils"
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

  const typeLabel = ITEM_TYPE_LABELS[item.type]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
        {/* ————————— Main content ————————— */}
        <div className="lg:col-span-2 space-y-10">
          {/* Header */}
          <header>
            <Link
              href={isGuidance ? "/guidance" : "/"}
              className="inline-block text-[13px] text-muted hover:text-duke-blue transition-colors mb-6"
            >
              ← {isGuidance ? "Guidance" : "Browse"}
            </Link>

            <div className="flex items-start justify-between gap-6 mb-5">
              <div className="flex-1 min-w-0">
                {/* Small-caps type label */}
                <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted mb-4">
                  {typeLabel}
                </div>

                {/* Title */}
                <h1 className="font-serif text-[34px] sm:text-[40px] md:text-[48px] leading-[1.08] text-duke-blue tracking-tight">
                  {item.title}
                </h1>
              </div>

              {isAuthor && (
                <Link
                  href={`/items/${id}/edit`}
                  className="shrink-0 px-3 py-1.5 border border-rule rounded-full text-[12px] font-medium text-muted hover:border-duke-blue hover:text-duke-blue transition-colors"
                >
                  Edit
                </Link>
              )}
            </div>

            {/* Author meta row */}
            <div className="flex flex-wrap items-center gap-2.5 text-[13px]">
              {item.author.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.author.image}
                  alt=""
                  className="w-[26px] h-[26px] rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-[26px] h-[26px] rounded-full bg-duke-blue text-white flex items-center justify-center text-[11px] font-medium shrink-0">
                  {item.author.name?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <Link
                href={`/profile/${item.author.id}`}
                className="font-medium text-ink hover:text-duke-blue transition-colors"
              >
                {item.author.name}
              </Link>
              {item.author.title && (
                <>
                  <span className="text-rule">·</span>
                  <span className="text-muted">{item.author.title}</span>
                </>
              )}
              {item.author.department && (
                <>
                  <span className="text-rule">·</span>
                  <span className="text-muted">{item.author.department}</span>
                </>
              )}
              <span className="text-rule">·</span>
              <span className="text-muted">{formatDate(item.createdAt)}</span>
            </div>
          </header>

          {/* Unpublished banner — visible only to author/CTL staff */}
          {!item.published && (
            <div className="border border-red-300 bg-red-50 rounded-lg p-4">
              <p className="text-[13px] font-semibold text-red-800">
                This item is unpublished.
              </p>
              <p className="text-[12px] text-red-700 mt-1">
                Only the author and CTL staff can see this page. It does not appear in browse results.
              </p>
            </div>
          )}

          {/* Description — editorial prose, no bounding card */}
          <article
            className="prose max-w-none text-ink leading-relaxed"
            dangerouslySetInnerHTML={{ __html: item.description }}
          />

          {/* Links & file */}
          {(item.externalLink || item.fileUrl) && (
            <div className="border-t border-rule pt-6">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted mb-3">
                Attachments &amp; Links
              </h3>
              <div className="space-y-2">
                {item.externalLink && (
                  <a
                    href={item.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[14px] text-duke-blue hover:underline break-all"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="flex items-center gap-2 text-[14px] text-duke-blue hover:underline"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Attachment
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <Link
                  key={tag.name}
                  href={`/?tags=${tag.name}`}
                  className="text-[12px] text-muted px-2.5 py-0.5 bg-cream rounded-full hover:bg-duke-blue/10 hover:text-duke-blue transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Reviews (community items only) */}
          {!isGuidance && (
            <section className="border-t border-rule pt-10">
              <div className="flex items-baseline gap-3 mb-6">
                <h2 className="font-serif text-[28px] text-duke-blue tracking-tight">
                  Reviews
                </h2>
                <span className="text-[13px] text-muted">
                  {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </span>
              </div>

              {session?.user ? (
                <div className="bg-white border border-rule rounded-lg p-6 mb-6">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted mb-4">
                    {hasReviewed ? "Your review" : "Write a review"}
                  </h3>
                  <ReviewForm itemId={id} hasReviewed={hasReviewed} />
                </div>
              ) : (
                <div className="bg-cream border border-rule rounded-lg p-5 mb-6 text-center">
                  <p className="text-[13px] text-muted">
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
                <p className="text-[13px] text-muted text-center py-8">
                  No reviews yet.
                </p>
              )}
            </section>
          )}
        </div>

        {/* ————————— Sidebar ————————— */}
        <aside className="space-y-6">
          {/* CTL Curated — guidance items; top of sidebar for primacy */}
          {item.ctlCurated && (
            <div className="border-[1.5px] border-eno bg-white rounded-lg p-5">
              <div className="flex items-center gap-2 mb-2">
                <svg viewBox="0 0 12 12" fill="none" className="w-[13px] h-[13px] text-eno">
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="6" cy="6" r="2" fill="currentColor" />
                </svg>
                <span className="text-eno text-[11px] font-bold uppercase tracking-[0.12em]">
                  CTL Curated
                </span>
              </div>
              <p className="text-[13px] text-muted leading-relaxed">
                Vetted and published by the Duke Center for Teaching &amp; Learning.
              </p>
            </div>
          )}

          {/* CTL Endorsed — community items; top of sidebar for primacy when present */}
          {item.ctlEndorsed && (
            <div className="border-[1.5px] border-piedmont bg-white rounded-lg p-5">
              <div className="flex items-center gap-2 mb-2">
                <svg viewBox="0 0 12 12" fill="none" className="w-[13px] h-[13px] text-piedmont">
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M3.5 6.3l1.7 1.7L8.7 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-piedmont text-[11px] font-bold uppercase tracking-[0.12em]">
                  CTL Endorsed
                </span>
              </div>
              <p className="text-[13px] text-muted leading-relaxed">
                Recognized by the Duke Center for Teaching &amp; Learning as a valuable community contribution.
              </p>
            </div>
          )}

          {/* Score summary — community items only; visually primary */}
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

          {/* Details meta block */}
          <div className="bg-white border border-rule rounded-lg p-5 space-y-2.5 text-[13px]">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted mb-2">
              Details
            </h3>
            <p className="flex justify-between gap-2">
              <span className="text-muted">Type</span>
              <span className="text-ink font-medium">{typeLabel}</span>
            </p>
            <p className="flex justify-between gap-2">
              <span className="text-muted">Submitted</span>
              <span className="text-ink">{formatDate(item.createdAt)}</span>
            </p>
            {item.updatedAt !== item.createdAt && (
              <p className="flex justify-between gap-2">
                <span className="text-muted">Updated</span>
                <span className="text-ink">{formatDate(item.updatedAt)}</span>
              </p>
            )}
            {isGuidance && item.lastReviewedAt && (
              <p className="flex justify-between gap-2">
                <span className="text-muted">Last Reviewed</span>
                <span className="text-ink">{formatDate(item.lastReviewedAt)}</span>
              </p>
            )}
          </div>

          {/* Related CTL Guidance — community items only */}
          {!isGuidance && relatedGuidance.length > 0 && (
            <div className="bg-white border border-rule rounded-lg p-5">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted mb-3">
                Related CTL Guidance
              </h3>
              <ul className="space-y-3">
                {relatedGuidance.map((g) => (
                  <li key={g.id}>
                    <Link
                      href={`/items/${g.id}`}
                      className="block text-[13px] text-duke-blue hover:underline font-medium leading-snug"
                    >
                      {g.title}
                    </Link>
                    <span className="text-[10px] uppercase tracking-[0.12em] text-muted">
                      {ITEM_TYPE_LABELS[g.type]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTL Staff controls — visually quieter, at bottom; includes cover picker */}
          {isCtlStaff && (
            <ItemAdminControls
              itemId={item.id}
              itemType={item.type}
              published={item.published}
              ctlCurated={item.ctlCurated}
              ctlEndorsed={item.ctlEndorsed}
              coverImage={item.coverImage}
              coverImageMood={item.coverImageMood}
            />
          )}
        </aside>
      </div>
    </div>
  )
}
