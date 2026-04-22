"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"
import { cn } from "@/lib/utils"

const TYPES = [
  { value: "", label: "All" },
  { value: "ASSIGNMENT", label: "Assignments" },
  { value: "RESOURCE", label: "Resources" },
  { value: "TOOL", label: "Tools" },
]

interface BrowseControlsProps {
  currentType?: string
  currentQ?: string
}

export function BrowseControls({ currentType, currentQ }: BrowseControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete("page")
      startTransition(() => {
        router.push(`/?${params.toString()}`)
      })
    },
    [router, searchParams]
  )

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="search"
          defaultValue={currentQ}
          placeholder="Search by title…"
          onChange={(e) => update("q", e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-rule rounded-full text-sm text-ink placeholder:text-muted focus:outline-none focus:border-duke-blue bg-white"
        />
      </div>

      {/* Type filter */}
      <div className="flex gap-2 flex-wrap">
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => update("type", t.value)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
              (currentType ?? "") === t.value
                ? "bg-duke-blue text-white border-duke-blue"
                : "bg-white text-duke-blue border-rule hover:border-duke-blue"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
