import Link from "next/link"
import Image from "next/image"
import { ItemType } from "@prisma/client"
import {
  computeOverallAverage,
  GUIDANCE_TYPES,
  ITEM_TYPE_LABELS,
} from "@/lib/utils"
import { decideCover } from "@/lib/cover"

interface ItemCardProps {
  item: {
    id: string
    title: string
    description: string
    type: ItemType
    coverImage?: string | null
    ctlEndorsed?: boolean
    ctlCurated?: boolean
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
  const overall = item.aggregates
    ? computeOverallAverage({
        studentAgency: item.aggregates._avg.studentAgency,
        biasMitigation: item.aggregates._avg.biasMitigation,
        dataSecurity: item.aggregates._avg.dataSecurity,
        accessibility: item.aggregates._avg.accessibility,
        studentLearning: item.aggregates._avg.studentLearning,
      })
    : null

  const descriptionPreview = item.description.replace(/<[^>]+>/g, "").slice(0, 140)
  const isTruncated =
    item.description.replace(/<[^>]+>/g, "").length > 140

  const isGuidance = (GUIDANCE_TYPES as readonly string[]).includes(item.type)
  const typeLabel = ITEM_TYPE_LABELS[item.type] ?? item.type

  const cover = decideCover({
    id: item.id,
    title: item.title,
    type: item.type,
    coverImage: item.coverImage,
  })

  return (
    <Link href={`/items/${item.id}`} className="block group">
      <article className="flex flex-col">
        {/* Cover */}
        <div className="relative aspect-[4/3] overflow-hidden bg-cream mb-5">
          {cover.kind === "photo" && (
            <Image
              src={cover.src}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          )}

          {cover.kind === "svg" && <AbstractCover pattern={cover.pattern} />}

          {cover.kind === "mono" && <MonogramCover letters={cover.letters} />}

          {/* CTL recognition seal */}
          {item.ctlCurated && <CtlSeal variant="curated" />}
          {item.ctlEndorsed && <CtlSeal variant="endorsed" />}
        </div>

        {/* Type label */}
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted mb-3">
          {typeLabel}
        </div>

        {/* Title */}
        <h2 className="font-serif text-[22px] leading-[1.18] tracking-tight text-duke-blue mb-3 line-clamp-3">
          {item.title}
        </h2>

        {/* Description */}
        {descriptionPreview && (
          <p className="text-sm leading-relaxed text-muted mb-5 line-clamp-2">
            {descriptionPreview}
            {isTruncated ? "…" : ""}
          </p>
        )}

        {/* Meta: author + rating or review count */}
        <div className="flex items-center gap-2.5 mb-4 text-[13px]">
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
          <span className="font-medium text-ink truncate">
            {item.author.name ?? "Anonymous"}
          </span>
          {!isGuidance && (
            <>
              <span className="text-rule">·</span>
              <span className="text-muted shrink-0">
                {overall !== null ? (
                  <>
                    <span className="text-ink font-medium">
                      {overall.toFixed(1)}
                    </span>
                    <span className="mx-1">·</span>
                    {item._count.reviews}{" "}
                    {item._count.reviews === 1 ? "review" : "reviews"}
                  </>
                ) : (
                  <>
                    {item._count.reviews}{" "}
                    {item._count.reviews === 1 ? "review" : "reviews"}
                  </>
                )}
              </span>
            </>
          )}
        </div>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.slice(0, 4).map((tag) => (
              <span
                key={tag.name}
                className="text-[12px] text-muted px-2.5 py-0.5 bg-cream rounded-full"
              >
                {tag.name}
              </span>
            ))}
            {item.tags.length > 4 && (
              <span className="text-[12px] text-muted px-1">
                +{item.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </article>
    </Link>
  )
}

/* ———————————————————————————————————————————— */
/* CTL recognition seals                          */
/* ———————————————————————————————————————————— */

function CtlSeal({ variant }: { variant: "curated" | "endorsed" }) {
  const isCurated = variant === "curated"
  const label = isCurated ? "CTL Curated" : "CTL Endorsed"
  const color = isCurated ? "text-eno border-eno" : "text-piedmont border-piedmont"

  return (
    <div
      className={`absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-sm border-[1.5px] ${color} text-[10px] font-bold uppercase tracking-[0.12em]`}
    >
      <svg viewBox="0 0 12 12" fill="none" className="w-[11px] h-[11px]">
        <circle
          cx="6"
          cy="6"
          r="5"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        {isCurated ? (
          <circle cx="6" cy="6" r="2" fill="currentColor" />
        ) : (
          <path
            d="M3.5 6.3l1.7 1.7L8.7 4.5"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      <span>{label}</span>
    </div>
  )
}

/* ———————————————————————————————————————————— */
/* Monogram fallback (community items w/o image)  */
/* ———————————————————————————————————————————— */

function MonogramCover({ letters }: { letters: string }) {
  const isPair = letters.length === 2
  return (
    <div className="absolute inset-0 bg-cream flex items-center justify-center">
      <span
        className={`font-serif italic text-duke-blue leading-none ${
          isPair ? "tracking-[-0.04em]" : ""
        }`}
        style={{
          fontSize: isPair ? "clamp(80px, 36%, 150px)" : "clamp(100px, 48%, 200px)",
          marginTop: "-0.05em",
        }}
      >
        {letters}
      </span>
      <div className="absolute top-4 left-4 right-4 h-px bg-duke-blue/15" />
      <div className="absolute bottom-4 left-4 right-4 h-px bg-duke-blue/15" />
    </div>
  )
}

/* ———————————————————————————————————————————— */
/* Abstract SVG covers (guidance items w/o photo) */
/* ———————————————————————————————————————————— */

function AbstractCover({ pattern }: { pattern: 0 | 1 | 2 | 3 | 4 }) {
  switch (pattern) {
    case 0:
      // Bauhaus primary shapes
      return (
        <svg
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full"
        >
          <rect width="400" height="300" fill="#F3EEE2" />
          <circle cx="285" cy="118" r="88" fill="#012169" opacity="0.9" />
          <rect x="52" y="172" width="186" height="96" fill="#339898" opacity="0.88" />
          <polygon points="30,40 170,40 100,140" fill="#A1B70D" opacity="0.82" />
        </svg>
      )
    case 1:
      // Rothko color bands
      return (
        <svg
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full"
        >
          <rect width="400" height="300" fill="#F3EEE2" />
          <rect x="0" y="34" width="400" height="108" fill="#012169" opacity="0.92" />
          <rect x="0" y="158" width="400" height="72" fill="#339898" opacity="0.88" />
          <rect x="0" y="246" width="400" height="44" fill="#A1B70D" opacity="0.78" />
        </svg>
      )
    case 2:
      // Concentric / structural on navy
      return (
        <svg
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full"
        >
          <rect width="400" height="300" fill="#012169" />
          <rect
            x="28"
            y="28"
            width="344"
            height="244"
            fill="none"
            stroke="#F3EEE2"
            strokeWidth="0.8"
          />
          <circle
            cx="200"
            cy="150"
            r="104"
            fill="none"
            stroke="#F3EEE2"
            strokeWidth="0.6"
            opacity="0.4"
          />
          <circle cx="200" cy="150" r="72" fill="none" stroke="#339898" strokeWidth="1.2" />
          <circle cx="200" cy="150" r="38" fill="#339898" />
          <circle cx="200" cy="150" r="14" fill="#A1B70D" />
        </svg>
      )
    case 3:
      // Architectural blocks
      return (
        <svg
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full"
        >
          <rect width="400" height="300" fill="#F3EEE2" />
          <rect x="0" y="0" width="152" height="300" fill="#012169" />
          <rect x="152" y="180" width="248" height="120" fill="#339898" />
          <circle cx="78" cy="232" r="34" fill="#A1B70D" />
          <line
            x1="152"
            y1="0"
            x2="152"
            y2="300"
            stroke="#F3EEE2"
            strokeWidth="0.5"
            opacity="0.3"
          />
        </svg>
      )
    case 4:
      // Horizontal split with triangle
      return (
        <svg
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full"
        >
          <rect width="400" height="300" fill="#F3EEE2" />
          <polygon points="200,46 352,254 48,254" fill="#012169" opacity="0.92" />
          <polygon points="200,46 352,254 200,254" fill="#339898" opacity="0.65" />
          <rect x="0" y="270" width="400" height="30" fill="#A1B70D" opacity="0.5" />
        </svg>
      )
  }
}
