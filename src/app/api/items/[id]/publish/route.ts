import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!session.user.isCtlStaff) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const published = Boolean(body.published)

  const item = await prisma.item.findUnique({ where: { id }, select: { id: true } })
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const updated = await prisma.item.update({
    where: { id },
    data: { published },
    select: { id: true, published: true },
  })

  return NextResponse.json(updated)
}
