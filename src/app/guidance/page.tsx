import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import type { Prisma } from "@prisma/client"
import { ItemCard } from "@/components/items/ItemCard"
import { EmptyState } from "@/components/ui/EmptyState"
import Link from "next/link"
import { GUIDANCE_TYPES } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface GuidancePageProps {
  searchParams: Promise<{
    type?: string
    q?: string
    page?: string
  }>
}

const GUIDANCE_FILTERS = [
  { value: "", label: "All" },
  { value: "SYLLABUS_LANGUAGE", label: "Syllabus Language" },
  { value: "TEMPLATE", label: "Template" },
  { value: "CASE_STUDY", label: "Case Study" },
  { value: "TOOLKIT", label: "Toolkit" },
]

export default async function GuidancePage({ searchParams }: GuidancePageProps) {
  const { type, q, page: pageParam } = await searchParams
  const page = parseInt(pageParam ?? "1")
  const limit = 12

  const session = await getServerSession(authOptions)
  const isCtlStaff = session?.user?.id
    ? (
        await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { isCtlStaff: true },
        })
      )?.isCtlStaff ?? false
    : false

  const where: Prisma.ItemWhereInput = {
    published: true,
    type: { in: GUIDANCE_TYPES },
  }

  if (type && (GUIDANCE_TYPES as string[]).includes(type)) {
    where.type = type as (typeof GUIDANCE_TYPES)[number]
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      {/* Hero — editorial */}
      <header className="mb-12 flex items-start justify-between gap-6">
        <div className="max-w-3xl">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-eno mb-4">
            A Registry of Academic Innovation
          </div>
          <h1 className="font-serif italic text-duke-blue text-5xl sm:text-6xl lg:text-7xl leading-[0.98] tracking-tight mb-5">
            CTL Guidance.
          </h1>
          <p className="text-lg text-muted leading-relaxed max-w-2xl">
            Vetted resources from the Duke Center for Teaching &amp; Learning —
            including syllabus language, templates, and case studies to support
            responsible AI use in your courses.
          </p>
        </div>
        {isCtlStaff && (
          <Link
            href="/guidance/new"
            className="shrink-0 mt-2 bg-duke-blue text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-duke-blue-dark transition-colors"
          >
            + Submit Guidance
          </Link>
        )}
      </header>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <form>
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search guidance…"
              className="w-full pl-10 pr-4 py-2.5 border border-rule rounded-full text-sm text-ink placeholder:text-muted focus:outline-none focus:border-duke-blue bg-white"
            />
          </form>
        </div>
        <div className="flex gap-2 flex-wrap">
          {GUIDANCE_FILTERS.map((f) => (
            <Link
              key={f.value}
              href={
                f.value
                  ? `/guidance?type=${f.value}${q ? `&q=${q}` : ""}`
                  : `/guidance${q ? `?q=${q}` : ""}`
              }
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                (type ?? "") === f.value
                  ? "bg-duke-blue text-white border-duke-blue"
                  : "bg-white text-duke-blue border-rule hover:border-duke-blue"
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="mt-12">
        {items.length === 0 ? (
          <EmptyState
            title="No guidance found"
            description={
              q || type
                ? "Try adjusting your search or filters."
                : "CTL guidance will appear here once published."
            }
          />
        ) : (
          <>
            <p className="text-sm text-muted mb-8">
              Showing {(page - 1) * limit + 1}–
              {Math.min(page * limit, total)} of {total} items
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-9 gap-y-14">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-16">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => {
                    const params = new URLSearchParams()
                    if (type) params.set("type", type)
                    if (q) params.set("q", q)
                    params.set("page", String(p))
                    return (
                      <Link
                        key={p}
                        href={`/guidance?${params.toString()}`}
                        className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                          p === page
                            ? "bg-duke-blue text-white"
                            : "bg-white border border-rule text-duke-blue hover:border-duke-blue"
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
