// src/components/items/ItemAdminControls.tsx — Phase 4b: includes cover picker
"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { GUIDANCE_TYPES } from "@/lib/utils"
import type { ItemType } from "@prisma/client"
import { CoverImagePicker } from "./CoverImagePicker"

interface ItemAdminControlsProps {
  itemId: string
  itemType: ItemType
  published: boolean
  ctlCurated: boolean
  ctlEndorsed: boolean
  coverImage: string | null
  coverImageMood: string | null
}

export function ItemAdminControls({
  itemId,
  itemType,
  published: initialPublished,
  ctlCurated: initialCurated,
  ctlEndorsed: initialEndorsed,
  coverImage,
  coverImageMood,
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
    <div className="border-t border-rule pt-5 mt-2">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted mb-1">
        Staff Tools
      </h3>
      <p className="text-[12px] text-muted mb-4">Visible only to CTL staff.</p>

      {/* Cover image picker */}
      <CoverImagePicker
        itemId={itemId}
        currentCoverImage={coverImage}
        currentCoverImageMood={coverImageMood}
      />

      {/* Action buttons */}
      <div className="space-y-1.5 mt-5">
        {isGuidance ? (
          <button
            type="button"
            onClick={toggleCurate}
            disabled={isPending}
            className="w-full text-left px-3 py-2 border border-rule rounded-md text-[12px] text-muted hover:border-duke-blue hover:text-duke-blue transition-colors disabled:opacity-50"
          >
            {ctlCurated ? "Remove CTL Curated status" : "Mark as CTL Curated"}
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleEndorse}
            disabled={isPending}
            className="w-full text-left px-3 py-2 border border-rule rounded-md text-[12px] text-muted hover:border-duke-blue hover:text-duke-blue transition-colors disabled:opacity-50"
          >
            {ctlEndorsed ? "Remove CTL Endorsement" : "Mark as CTL Endorsed"}
          </button>
        )}

        <button
          type="button"
          onClick={togglePublish}
          disabled={isPending}
          className="w-full text-left px-3 py-2 border border-rule rounded-md text-[12px] text-muted hover:border-red-400 hover:text-red-700 transition-colors disabled:opacity-50"
        >
          {published ? "Unpublish item" : "Republish item"}
        </button>
      </div>

      {error && <p className="text-[12px] text-red-600 mt-3">{error}</p>}
    </div>
  )
}
