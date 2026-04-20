import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { ItemCard } from "@/components/items/ItemCard"
import { EmptyState } from "@/components/ui/EmptyState"
import { BrowseControls } from "./BrowseControls"
import Link from "next/link"
import { COMMUNITY_TYPES } from "@/lib/utils"

interface HomePageProps {
  searchParams: Promise<{
    type?: string
    q?: string
    tags?: string
    page?: string
  }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { type, q, tags: tagsParam, page: pageParam } = await searchParams
  const page = parseInt(pageParam ?? "1")
  const limit = 12

  const where: Prisma.ItemWhereInput = {
    published: true,
    type: { in: COMMUNITY_TYPES },
  }

  if (type && (["ASSIGNMENT", "RESOURCE", "TOOL"] as string[]).includes(type)) {
    where.type = type as "ASSIGNMENT" | "RESOURCE" | "TOOL"
  }

  if (tagsParam) {
    const tagNames = tagsParam.split(",").map((t) => t.trim()).filter(Boolean)
    if (tagNames.length > 0) {
      where.tags = { some: { name: { in: tagNames } } }
    }
  }

  if (q) {
    where.title = { contains: q, mode: "insensitive" }
  }

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, image: true } },
        tags: { select: { name: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.item.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-duke-blue mb-2">
          AI &amp; Education Guidance Hub
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover, share, and review assignments, resources, and tools for responsible AI use — curated by the Duke community.
        </p>
      </div>

      {/* Controls */}
      <BrowseControls currentType={type} currentQ={q} />

      {/* Results */}
      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState
            title="No items found"
            description={
              q || type
                ? "Try adjusting your search or filters."
                : "Be the first to contribute to the Hub!"
            }
            action={
              <Link
                href="/items/new"
                className="inline-flex items-center gap-2 bg-duke-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-duke-blue-dark transition-colors"
              >
                Submit an Item
              </Link>
            }
          />
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Showing {(page - 1) * limit + 1}–
              {Math.min(page * limit, total)} of {total} items
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => {
                    const params = new URLSearchParams()
                    if (type) params.set("type", type)
                    if (q) params.set("q", q)
                    if (tagsParam) params.set("tags", tagsParam)
                    params.set("page", String(p))
                    return (
                      <Link
                        key={p}
                        href={`/?${params.toString()}`}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          p === page
                            ? "bg-duke-blue text-white"
                            : "bg-white border border-gray-200 text-gray-700 hover:border-duke-blue/30 hover:text-duke-blue"
                        }`}
                      >
                        {p}
                      </Link>
                    )
                  }
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
