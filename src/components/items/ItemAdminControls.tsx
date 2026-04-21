"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { GUIDANCE_TYPES } from "@/lib/utils"
import type { ItemType } from "@prisma/client"

interface ItemAdminControlsProps {
  itemId: string
  itemType: ItemType
  published: boolean
  ctlCurated: boolean
  ctlEndorsed: boolean
}

export function ItemAdminControls({
  itemId,
  itemType,
  published: initialPublished,
  ctlCurated: initialCurated,
  ctlEndorsed: initialEndorsed,
}: ItemAdminControlsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [published, setPublished] = useState(initialPublished)
  const [ctlCurated, setCtlCurated] = useState(initialCurated)
  const [ctlEndorsed, setCtlEndorsed] = useState(initialEndorsed)
  const [error, setError] = useState<string | null>(null)

  const isGuidance = (GUIDANCE_TYPES as string[]).includes(itemType)

  async function toggleCurate() {
    setError(null)
    const next = !ctlCurated
    const res = await fetch(`/api/items/${itemId}/curate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ctlCurated: next }),
    })
    if (!res.ok) {
      setError("Failed to update CTL Curated status.")
      return
    }
    setCtlCurated(next)
    startTransition(() => router.refresh())
  }

  async function toggleEndorse() {
    setError(null)
    const next = !ctlEndorsed
    const res = await fetch(`/api/items/${itemId}/endorse`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ctlEndorsed: next }),
    })
    if (!res.ok) {
      setError("Failed to update CTL Endorsed status.")
      return
    }
    setCtlEndorsed(next)
    startTransition(() => router.refresh())
  }

  async function togglePublish() {
    setError(null)
    const next = !published
    const res = await fetch(`/api/items/${itemId}/publish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: next }),
    })
    if (!res.ok) {
      setError("Failed to update publish status.")
      return
    }
    setPublished(next)
    startTransition(() => router.refresh())
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
      <h3 className="font-semibold text-gray-900 text-sm mb-1">CTL Staff Controls</h3>
      <p className="text-xs text-gray-500 mb-4">
        Actions visible only to Duke CTL staff.
      </p>

      <div className="space-y-2">
        {isGuidance ? (
          <button
            type="button"
            onClick={toggleCurate}
            disabled={isPending}
            className="w-full text-left px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:border-duke-blue hover:text-duke-blue transition-colors disabled:opacity-50"
          >
            {ctlCurated ? "Remove CTL Curated status" : "Mark as CTL Curated"}
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleEndorse}
            disabled={isPending}
            className="w-full text-left px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:border-duke-blue hover:text-duke-blue transition-colors disabled:opacity-50"
          >
            {ctlEndorsed ? "Remove CTL Endorsement" : "Mark as CTL Endorsed"}
          </button>
        )}

        <button
          type="button"
          onClick={togglePublish}
          disabled={isPending}
          className="w-full text-left px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:border-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
        >
          {published ? "Unpublish item" : "Republish item"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600 mt-3">{error}</p>
      )}
    </div>
  )
}
