import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { reviewId } = await params
  const review = await prisma.review.findUnique({ where: { id: reviewId } })

  if (!review) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  if (review.reviewerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.review.delete({ where: { id: reviewId } })
  return NextResponse.json({ success: true })
}
