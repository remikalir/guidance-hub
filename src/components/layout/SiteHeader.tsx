import Link from "next/link"
import Image from "next/image"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NavUser } from "./NavUser"

export async function SiteHeader() {
  const session = await getServerSession(authOptions)
  const user = session?.user ?? null

  return (
    <header>
      {/* Tier 1 — Duke CTL institutional mark */}
      <div className="bg-white border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              aria-label="Duke Center for Teaching and Learning"
              className="flex items-center"
            >
              <Image
                src="/brand/ctl-mark.png"
                alt="Duke Center for Teaching and Learning"
                height={80}
                width={480}
                priority
                className="h-10 w-auto object-contain"
              />
            </Link>
            <NavUser user={user} />
          </div>
        </div>
      </div>

      {/* Tier 2 — Product identity */}
      <div className="bg-duke-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 py-5 sm:py-6">
            <Link
              href="/"
              className="font-serif italic text-white text-2xl sm:text-3xl tracking-tight leading-none"
            >
              AI <span className="opacity-70">&</span> Education Guidance Hub
            </Link>
            <nav className="flex items-center gap-6 sm:gap-8 text-xs tracking-[0.14em] uppercase font-medium">
              <Link
                href="/"
                className="text-white/75 hover:text-white border-b border-transparent hover:border-white pb-1 transition-colors"
              >
                Browse
              </Link>
              <Link
                href="/guidance"
                className="text-white/75 hover:text-white border-b border-transparent hover:border-white pb-1 transition-colors"
              >
                Guidance
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
