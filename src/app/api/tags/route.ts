import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.toLowerCase().trim() ?? ""

  if (q.length < 1) return NextResponse.json([])

  const tags = await prisma.tag.findMany({
    where: { name: { startsWith: q } },
    select: { name: true },
    take: 10,
    orderBy: { name: "asc" },
  })

  return NextResponse.json(tags.map((t) => t.name))
}
