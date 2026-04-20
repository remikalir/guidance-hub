import Link from "next/link"
import Image from "next/image"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NavUser } from "./NavUser"

export async function SiteHeader() {
  const session = await getServerSession(authOptions)
  const user = session?.user ?? null

  return (
    <header className="bg-duke-blue shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logos — left */}
          <div className="flex items-center gap-3 w-1/3">
            <Image src="/Duke_AI.png" alt="Duke AI" height={36} width={120} className="object-contain" />
            <Image src="/CTL.png" alt="Center for Teaching & Learning" height={48} width={160} className="object-contain" />
          </div>

          {/* Title — center */}
          <div className="flex justify-center w-1/3">
            <Link href="/" className="text-white font-bold text-xl">
              Guidance Hub
            </Link>
          </div>

          {/* Nav — right */}
          <nav className="flex items-center gap-2 justify-end w-1/3">
            <Link
              href="/"
              className="text-white/80 hover:text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
            >
              Browse
            </Link>
            <Link
              href="/guidance"
              className="text-white/80 hover:text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
            >
              Guidance
            </Link>
            <NavUser user={user} />
          </nav>
        </div>
      </div>
    </header>
  )
}
