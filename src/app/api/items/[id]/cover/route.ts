// src/app/api/items/[id]/cover/route.ts — Phase 4b: CTL staff cover assignment
//
// PATCH /api/items/:id/cover
// Body: { coverImage: string | null, coverImageMood?: string | null }
// Auth: CTL staff only (session.user.isCtlStaff === true)
//
// Stores the filename in Item.coverImage. The existing cover cascade in
// src/lib/cover.ts handles rendering: if the stored value starts with "/"
// it's used as-is, otherwise prefixed with "/images/covers/".

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.isCtlStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { coverImage, coverImageMood } = (body ?? {}) as {
    coverImage?: string | null
    coverImageMood?: string | null
  }

  if (
    coverImage !== null &&
    coverImage !== undefined &&
    typeof coverImage !== "string"
  ) {
    return NextResponse.json(
      { error: "coverImage must be a string or null" },
      { status: 400 }
    )
  }
  if (
    coverImageMood !== null &&
    coverImageMood !== undefined &&
    typeof coverImageMood !== "string"
  ) {
    return NextResponse.json(
      { error: "coverImageMood must be a string or null" },
      { status: 400 }
    )
  }

  try {
    const updated = await prisma.item.update({
      where: { id },
      data: {
        coverImage: coverImage ?? null,
        coverImageMood: coverImageMood ?? null,
      },
      select: { id: true, coverImage: true, coverImageMood: true },
    })
    return NextResponse.json({ ok: true, item: updated })
  } catch (error) {
    console.error("Failed to update cover image:", error)
    return NextResponse.json(
      { error: "Failed to update cover image" },
      { status: 500 }
    )
  }
}
