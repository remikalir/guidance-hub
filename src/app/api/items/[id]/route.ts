import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateItemSchema } from "@/lib/validations"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const [item, aggregates] = await Promise.all([
    prisma.item.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, image: true, department: true, title: true } },
        tags: { select: { name: true } },
        _count: { select: { reviews: true } },
      },
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

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ ...item, aggregates })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const item = await prisma.item.findUnique({ where: { id } })

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  if (item.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = updateItemSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const { title, description, type, externalLink, tags, fileUrl, fileKey } = parsed.data
  const lastReviewedAt = body.lastReviewedAt ? new Date(body.lastReviewedAt) : undefined

  // Upsert tags if provided
  let tagConnect: { id: string }[] | undefined
  if (tags !== undefined) {
    const tagRecords = await Promise.all(
      tags.map((name) =>
        prisma.tag.upsert({
          where: { name: name.toLowerCase().trim() },
          update: {},
          create: { name: name.toLowerCase().trim() },
        })
      )
    )
    tagConnect = tagRecords.map((t) => ({ id: t.id }))
  }

  const updated = await prisma.item.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description && { description }),
      ...(type && { type }),
      ...(externalLink !== undefined && { externalLink: externalLink || null }),
      ...(fileUrl !== undefined && { fileUrl }),
      ...(fileKey !== undefined && { fileKey }),
      ...(tagConnect && { tags: { set: tagConnect } }),
      ...(lastReviewedAt !== undefined && { lastReviewedAt }),
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      tags: { select: { name: true } },
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const item = await prisma.item.findUnique({ where: { id } })

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  if (item.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Delete file from UploadThing if present
  if (item.fileKey) {
    try {
      const { UTApi } = await import("uploadthing/server")
      const utapi = new UTApi()
      await utapi.deleteFiles([item.fileKey])
    } catch {
      // Non-fatal: file cleanup failure shouldn't block item deletion
    }
  }

  await prisma.item.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
