// Auth protection is handled server-side in individual pages via getServerSession + redirect()
// Next.js 16 uses proxy.ts instead of middleware.ts
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export function proxy(_req: NextRequest) {
  return NextResponse.next()
}

