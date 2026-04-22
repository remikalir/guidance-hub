// src/app/profile/[userId]/page.tsx — Phase 4c: profile page redesign
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ItemCard } from "@/components/items/ItemCard"
import { ReviewCard } from "@/components/reviews/ReviewCard"
import { EmptyState } from "@/components/ui/EmptyState"
import { CtlStaffToggle } from "@/components/layout/CtlStaffToggle"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const session = await getServerSession(authOptions)
  const viewerId = session?.user?.id
  const viewerIsCtlStaff = session?.user?.isCtlStaff === true

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      items: {
        // Author sees their own unpublished items; CTL staff see all.
        // Otherwise only published items are returned.
        where:
          viewerId === userId || viewerIsCtlStaff
            ? {}
            : { published: true },
        include: {
          author: { select: { id: true, name: true, image: true } },
          tags: { select: { name: true } },
          _count: { select: { reviews: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      reviews: {
        include: {
          item: {
            select: {
              id: true,
              title: true,
              type: true,
            },
          },
          reviewer: {
            select: { id: true, name: true, image: true, department: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  })

  if (!user) notFound()

  const isOwnProfile = viewerId === userId
  const displayName = user.name ?? "Anonymous"

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* ————————— Profile header ————————— */}
      <header className="mb-14">
        <div className="flex flex-wrap items-start gap-5 sm:gap-8">
          {/* Avatar */}
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              className="w-[88px] h-[88px] rounded-xl object-cover shrink-0"
            />
          ) : (
            <div className="w-[88px] h-[88px] rounded-xl bg-duke-blue text-white flex items-center justify-center shrink-0">
              <span className="font-serif italic text-[42px] leading-none -mt-1">
                {displayName[0]?.toUpperCase() ?? "?"}
              </span>
            </div>
          )}

          {/* Name + metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-3 mb-2">
              <h1 className="font-serif text-[30px] sm:text-[36px] md:text-[40px] leading-[1.08] text-duke-blue tracking-tight">
                {displayName}
              </h1>
              {user.isCtlStaff && (
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-duke-blue border border-duke-blue/30 rounded-full px-2.5 py-0.5 bg-white">
                  CTL Staff
                </span>
              )}
            </div>

            {user.title && (
              <p className="text-[14px] text-ink">{user.title}</p>
            )}
            {user.department && (
              <p className="text-[14px] text-muted">{user.department}</p>
            )}

            <p className="text-[12px] text-muted mt-3">
              Member since {formatDate(user.createdAt)}
            </p>
          </div>

          {/* Action (right-aligned; at most one of these renders at a time) */}
          <div className="shrink-0 ml-auto">
            {isOwnProfile && (
              <Link
                href="/items/new"
                className="inline-block bg-duke-blue text-white px-4 py-2 rounded-full text-[13px] font-medium hover:bg-duke-blue-dark transition-colors"
              >
                + Submit Item
              </Link>
            )}
            {viewerIsCtlStaff && !isOwnProfile && (
              <CtlStaffToggle userId={user.id} isCtlStaff={user.isCtlStaff} />
            )}
          </div>
        </div>
      </header>

      {/* ————————— Submissions ————————— */}
      <section className="mb-14">
        <div className="flex items-baseline gap-3 mb-6 pb-4 border-b border-rule">
          <h2 className="font-serif text-[28px] text-duke-blue tracking-tight">
            Submissions
          </h2>
          <span className="text-[13px] text-muted">
            {user.items.length} {user.items.length === 1 ? "item" : "items"}
          </span>
        </div>

        {user.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10">
            {user.items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nothing submitted yet"
            description={
              isOwnProfile
                ? "Share your first assignment, resource, or tool with the Hub."
                : "This instructor hasn't submitted anything yet."
            }
            action={
              isOwnProfile ? (
                <Link
                  href="/items/new"
                  className="inline-block bg-duke-blue text-white px-4 py-2 rounded-full text-[13px] font-medium hover:bg-duke-blue-dark transition-colors"
                >
                  Submit an Item
                </Link>
              ) : undefined
            }
          />
        )}
      </section>

      {/* ————————— Reviews Written ————————— */}
      <section>
        <div className="flex items-baseline gap-3 mb-6 pb-4 border-b border-rule">
          <h2 className="font-serif text-[28px] text-duke-blue tracking-tight">
            Reviews Written
          </h2>
          <span className="text-[13px] text-muted">
            {user.reviews.length} {user.reviews.length === 1 ? "review" : "reviews"}
          </span>
        </div>

        {user.reviews.length > 0 ? (
          <div className="space-y-4">
            {user.reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={{
                  ...review,
                  reviewer: {
                    id: user.id,
                    name: user.name,
                    image: user.image,
                    department: user.department,
                  },
                }}
                showItem
                hideReviewer
                itemTitle={review.item.title}
                itemId={review.item.id}
                itemType={review.item.type}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No reviews yet"
            description={
              isOwnProfile
                ? "Browse items in the Hub and leave your first review."
                : "This instructor hasn't reviewed any items yet."
            }
          />
        )}
      </section>
    </div>
  )
}
