// src/components/items/CoverImagePicker.tsx — Phase 4b: CTL staff cover assignment UI
"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  COVER_LIBRARY,
  COVER_MOOD_LABELS,
  COVER_MOOD_ORDER,
  type CoverLibraryEntry,
  type CoverMood,
} from "@/lib/covers-library"

interface CoverImagePickerProps {
  itemId: string
  currentCoverImage: string | null
  currentCoverImageMood: string | null
}

export function CoverImagePicker({
  itemId,
  currentCoverImage,
  currentCoverImageMood,
}: CoverImagePickerProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(currentCoverImage)
  const [selectedMood, setSelectedMood] = useState<string | null>(currentCoverImageMood)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Keep local selection in sync if the incoming prop changes (e.g. after router.refresh).
  useEffect(() => {
    if (!isOpen) {
      setSelected(currentCoverImage)
      setSelectedMood(currentCoverImageMood)
    }
  }, [currentCoverImage, currentCoverImageMood, isOpen])

  // Close on Escape, lock body scroll while open.
  useEffect(() => {
    if (!isOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false)
    }
    document.addEventListener("keydown", handleKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener("keydown", handleKey)
    }
  }, [isOpen])

  function openModal() {
    setSelected(currentCoverImage)
    setSelectedMood(currentCoverImageMood)
    setError(null)
    setIsOpen(true)
  }

  function closeModal() {
    if (isSaving) return
    setIsOpen(false)
  }

  async function save(coverImage: string | null, coverImageMood: string | null) {
    setError(null)
    setIsSaving(true)
    try {
      const res = await fetch(`/api/items/${itemId}/cover`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverImage, coverImageMood }),
      })
      if (!res.ok) {
        setError("Failed to update cover image.")
        setIsSaving(false)
        return
      }
      setIsSaving(false)
      setIsOpen(false)
      startTransition(() => router.refresh())
    } catch {
      setError("Failed to update cover image.")
      setIsSaving(false)
    }
  }

  function handleSelect(entry: CoverLibraryEntry) {
    setSelected(entry.filename)
    setSelectedMood(entry.mood)
  }

  // Group library by mood for display.
  const groupedByMood = COVER_LIBRARY.reduce<Record<string, CoverLibraryEntry[]>>(
    (acc, entry) => {
      if (!acc[entry.mood]) acc[entry.mood] = []
      acc[entry.mood].push(entry)
      return acc
    },
    {}
  )

  const hasCurrent = !!currentCoverImage
  const currentPath = currentCoverImage
    ? currentCoverImage.startsWith("/")
      ? currentCoverImage
      : `/images/covers/${currentCoverImage}`
    : null

  const hasChanges = selected !== currentCoverImage

  return (
    <>
      {/* ———————— Trigger block in Staff Tools ———————— */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.12em] text-muted font-medium mb-2">
          Cover image
        </p>
        {hasCurrent && currentPath ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-rule bg-cream mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentPath}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-[4/3] w-full rounded-md border border-dashed border-rule bg-cream/50 mb-2 flex items-center justify-center">
            <span className="text-[10px] text-muted uppercase tracking-[0.16em]">
              No cover assigned
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={openModal}
          className="w-full text-left px-3 py-2 border border-rule rounded-md text-[12px] text-muted hover:border-duke-blue hover:text-duke-blue transition-colors"
        >
          {hasCurrent ? "Change cover image" : "Assign cover image"}
        </button>
      </div>

      {/* ———————— Modal ———————— */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cover-picker-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40"
          onClick={closeModal}
        >
          <div
            className="relative bg-paper border border-rule rounded-lg shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between gap-4 p-5 border-b border-rule shrink-0">
              <div>
                <h2
                  id="cover-picker-title"
                  className="font-serif text-[22px] text-duke-blue leading-tight"
                >
                  Choose a cover image
                </h2>
                <p className="text-[12px] text-muted mt-1">
                  Curated from Duke&apos;s official photo library.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="text-muted hover:text-ink text-2xl leading-none -mt-1 shrink-0"
              >
                ×
              </button>
            </div>

            {/* Grid */}
            <div className="overflow-y-auto px-5 py-4 flex-1">
              {COVER_MOOD_ORDER.map((mood: CoverMood) => {
                const entries = groupedByMood[mood]
                if (!entries || entries.length === 0) return null
                return (
                  <section key={mood} className="mb-6 last:mb-1">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted mb-3">
                      {COVER_MOOD_LABELS[mood]}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {entries.map((entry) => {
                        const isSelected = selected === entry.filename
                        return (
                          <button
                            key={entry.filename}
                            type="button"
                            onClick={() => handleSelect(entry)}
                            aria-pressed={isSelected}
                            aria-label={entry.label}
                            title={entry.label}
                            className={`group relative aspect-[4/3] w-full overflow-hidden rounded-md transition-all ${
                              isSelected
                                ? "ring-[3px] ring-duke-blue"
                                : "ring-1 ring-rule hover:ring-duke-blue/40"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`/images/covers/${entry.filename}`}
                              alt=""
                              loading="lazy"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute bottom-0 left-0 right-0 bg-duke-blue text-white text-[10px] uppercase tracking-[0.12em] font-bold text-center py-1">
                                Selected
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </section>
                )
              })}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between gap-3 p-5 border-t border-rule shrink-0 bg-white">
              <div>
                {hasCurrent && (
                  <button
                    type="button"
                    onClick={() => save(null, null)}
                    disabled={isSaving}
                    className="text-[12px] text-muted hover:text-red-700 disabled:opacity-50 transition-colors"
                  >
                    Remove cover
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {error && (
                  <span className="text-[12px] text-red-600 mr-2">{error}</span>
                )}
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="px-3 py-1.5 border border-rule rounded-full text-[12px] text-muted hover:border-duke-blue hover:text-duke-blue transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => save(selected, selectedMood)}
                  disabled={isSaving || !hasChanges}
                  className="px-4 py-1.5 bg-duke-blue text-white rounded-full text-[12px] font-medium hover:bg-duke-blue-dark transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
