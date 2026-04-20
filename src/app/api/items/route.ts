import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createItemSchema } from "@/lib/validations"
import type { Prisma } from "@prisma/client"
import { COMMUNITY_TYPES, GUIDANCE_TYPES } from "@/lib/utils"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const tagsParam = searchParams.get("tags")
  const q = searchParams.get("q")
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "12"), 50)

  const where: Prisma.ItemWhereInput = {
    published: true,
  }

  const allTypes = [...COMMUNITY_TYPES, ...GUIDANCE_TYPES]
  if (type && (allTypes as string[]).includes(type)) {
    where.type = type as (typeof allTypes)[number]
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

  return NextResponse.json({ items, total, page, limit })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createItemSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const { title, description, type, externalLink, tags, fileUrl, fileKey } = parsed.data
  const lastReviewedAt = body.lastReviewedAt ? new Date(body.lastReviewedAt) : null

  // Only CTL staff can submit guidance types
  if ((GUIDANCE_TYPES as string[]).includes(type)) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isCtlStaff: true },
    })
    if (!user?.isCtlStaff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  // Upsert tags
  const tagRecords = await Promise.all(
    tags.map((name) =>
      prisma.tag.upsert({
        where: { name: name.toLowerCase().trim() },
        update: {},
        create: { name: name.toLowerCase().trim() },
      })
    )
  )

  const item = await prisma.item.create({
    data: {
      title,
      description,
      type,
      externalLink: externalLink || null,
      fileUrl: fileUrl || null,
      fileKey: fileKey || null,
      lastReviewedAt,
      authorId: session.user.id,
      tags: { connect: tagRecords.map((t) => ({ id: t.id })) },
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      tags: { select: { name: true } },
    },
  })

  return NextResponse.json(item, { status: 201 })
}
