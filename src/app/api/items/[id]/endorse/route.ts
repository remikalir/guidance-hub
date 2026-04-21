import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { GUIDANCE_TYPES } from "@/lib/utils"

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
  const ctlEndorsed = Boolean(body.ctlEndorsed)

  const item = await prisma.item.findUnique({
    where: { id },
    select: { id: true, type: true },
  })
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Endorsement is only valid for community-submitted items, not CTL guidance content.
  // Guidance content uses the `ctlCurated` flag instead.
  if ((GUIDANCE_TYPES as string[]).includes(item.type)) {
    return NextResponse.json(
      { error: "Guidance items cannot be endorsed; use CTL Curated instead." },
      { status: 400 }
    )
  }

  const updated = await prisma.item.update({
    where: { id },
    data: { ctlEndorsed },
    select: { id: true, ctlEndorsed: true },
  })

  return NextResponse.json(updated)
}
