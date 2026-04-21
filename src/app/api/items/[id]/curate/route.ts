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
  const ctlCurated = Boolean(body.ctlCurated)

  const item = await prisma.item.findUnique({
    where: { id },
    select: { id: true, type: true },
  })
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Curation is only valid for guidance-type items (CTL-authored content).
  // Community items use the `ctlEndorsed` flag instead.
  if (!(GUIDANCE_TYPES as string[]).includes(item.type)) {
    return NextResponse.json(
      { error: "Community items cannot be curated; use CTL Endorsed instead." },
      { status: 400 }
    )
  }

  const updated = await prisma.item.update({
    where: { id },
    data: { ctlCurated },
    select: { id: true, ctlCurated: true },
  })

  return NextResponse.json(updated)
}
