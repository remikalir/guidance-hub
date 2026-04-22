/**
 * Cover image cascade for item cards.
 *
 * Priority:
 *   1. If item has `coverImage`, use it (assumed to be a path under /images/covers/)
 *   2. If item is a guidance type, use a deterministic abstract SVG pattern
 *   3. Otherwise, use a typographic fallback (one or two letters from title)
 *
 * The choice is deterministic — same item always yields the same cover.
 */

import { GUIDANCE_TYPES } from "@/lib/utils"
import type { ItemType } from "@prisma/client"

const STOPWORDS = new Set([
  "a", "an", "the",
  "and", "or", "but",
  "of", "in", "on", "at", "for", "to", "by", "with", "from",
])

/**
 * Extract significant words from a title, skipping leading articles
 * and common short connectors. Preserves case of original words.
 */
function significantWords(title: string): string[] {
  return title
    .replace(/["'""'']/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .filter((w) => !STOPWORDS.has(w.toLowerCase()))
}

/**
 * Derive a monogram (1 or 2 letters) from a title.
 *
 * Rule (agreed 04.22.26): use first letters of the first two significant
 * words. If only one significant word, return a single letter.
 */
export function deriveMonogram(title: string): string {
  const words = significantWords(title)
  if (words.length === 0) {
    return title.charAt(0).toUpperCase() || "·"
  }
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  }
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
}

/**
 * Hash a string to a non-negative integer, deterministic across runs.
 * Used to pick an SVG pattern from the item's id.
 */
function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

/**
 * Five abstract SVG patterns in Duke palette.
 * Each takes a viewBox of 400x300 (4:3 aspect).
 * Used as deterministic backgrounds for guidance items without a photo.
 */
export type SvgPatternId = 0 | 1 | 2 | 3 | 4

export function pickSvgPattern(id: string): SvgPatternId {
  return (hashString(id) % 5) as SvgPatternId
}

/**
 * Decide what kind of cover to render for a given item.
 */
export type CoverKind =
  | { kind: "photo"; src: string }
  | { kind: "svg"; pattern: SvgPatternId }
  | { kind: "mono"; letters: string }

export function decideCover(item: {
  id: string
  title: string
  type: ItemType
  coverImage: string | null | undefined
}): CoverKind {
  if (item.coverImage) {
    const src = item.coverImage.startsWith("/")
      ? item.coverImage
      : `/images/covers/${item.coverImage}`
    return { kind: "photo", src }
  }

  if ((GUIDANCE_TYPES as readonly string[]).includes(item.type)) {
    return { kind: "svg", pattern: pickSvgPattern(item.id) }
  }

  return { kind: "mono", letters: deriveMonogram(item.title) }
}
