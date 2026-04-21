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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 flex items-start gap-5">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={user.name ?? ""}
            className="w-20 h-20 rounded-2xl object-cover border border-gray-200"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-duke-blue/10 flex items-center justify-center text-3xl font-bold text-duke-blue border border-duke-blue/20">
            {user.name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
            {user.isCtlStaff && (
              <span className="px-2 py-0.5 bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold rounded-full">
                CTL Staff
              </span>
            )}
          </div>
          {user.title && (
            <p className="text-gray-600 text-sm">{user.title}</p>
          )}
          {user.department && (
            <p className="text-gray-500 text-sm">{user.department}</p>
          )}
          <p className="text-gray-400 text-xs mt-2">
            Member since {formatDate(user.createdAt)}
          </p>
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <span>{user.items.length} submissions</span>
            <span>{user.reviews.length} reviews</span>
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          {isOwnProfile && (
            <Link
              href="/items/new"
              className="bg-duke-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-duke-blue-dark transition-colors"
            >
              + Submit Item
            </Link>
          )}
          {viewerIsCtlStaff && !isOwnProfile && (
            <CtlStaffToggle userId={user.id} isCtlStaff={user.isCtlStaff} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submissions */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Submitted Items ({user.items.length})
          </h2>
          {user.items.length > 0 ? (
            <div className="space-y-4">
              {user.items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No submissions yet"
              description={
                isOwnProfile
                  ? "Share your first assignment, resource, or tool with the Hub."
                  : "This instructor hasn't submitted anything yet."
              }
              action={
                isOwnProfile ? (
                  <Link
                    href="/items/new"
                    className="bg-duke-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-duke-blue-dark transition-colors"
                  >
                    Submit an Item
                  </Link>
                ) : undefined
              }
            />
          )}
        </div>

        {/* Reviews */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Reviews Written ({user.reviews.length})
          </h2>
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
                  itemTitle={review.item.title}
                  itemId={review.item.id}
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
        </div>
      </div>
    </div>
  )
}
