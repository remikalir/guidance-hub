import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createReviewSchema } from "@/lib/validations"
import { Prisma } from "@prisma/client"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const reviews = await prisma.review.findMany({
    where: { itemId: id },
    include: {
      reviewer: { select: { id: true, name: true, image: true, department: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(reviews)
}

export async function POST(
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
    return NextResponse.json({ error: "Item not found" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = createReviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    )
  }

  try {
    const review = await prisma.review.create({
      data: {
        itemId: id,
        reviewerId: session.user.id,
        ...parsed.data,
        comment: parsed.data.comment || null,
      },
      include: {
        reviewer: { select: { id: true, name: true, image: true } },
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "You have already reviewed this item" },
        { status: 409 }
      )
    }
    throw e
  }
}
