import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!session.user.isCtlStaff) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { userId } = await params

  // Guard: CTL staff cannot demote themselves (prevents accidental lockout of
  // the last admin). They can still be demoted by another CTL staff member,
  // or manually via Prisma Studio.
  if (userId === session.user.id) {
    return NextResponse.json(
      { error: "You cannot change your own CTL staff status." },
      { status: 400 }
    )
  }

  const body = await req.json()
  const isCtlStaff = Boolean(body.isCtlStaff)

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })
  if (!targetUser) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isCtlStaff },
    select: { id: true, isCtlStaff: true },
  })

  return NextResponse.json(updated)
}
