// src/lib/covers-library.ts — Phase 4b: catalog of curated cover images
//
// The 15 images in public/images/covers/ are the canonical library CTL staff
// can assign to any item via the cover picker. Mood groupings are informal
// (used to organize the picker UI and stored on Item.coverImageMood for
// potential future faceting) — not enforced by the schema.

export type CoverMood =
  | "discussion"
  | "focus"
  | "teaching"
  | "place"
  | "object"
  | "scholarly"

export interface CoverLibraryEntry {
  filename: string
  mood: CoverMood
  label: string
}

export const COVER_MOOD_LABELS: Record<CoverMood, string> = {
  discussion: "Discussion & collaboration",
  focus: "Focused attention",
  teaching: "Teaching",
  place: "Atmospheric & place",
  object: "Object & abstract",
  scholarly: "Scholarly exchange",
}

export const COVER_LIBRARY: CoverLibraryEntry[] = [
  // Discussion & collaboration
  { filename: "20240917_civildiscourse148.jpg", mood: "discussion", label: "Seminar discussion, hands raised" },
  { filename: "047708_darity034.jpg", mood: "discussion", label: "Seminar with chalkboard" },
  { filename: "20251015_westlifescenics064.jpg", mood: "discussion", label: "Outdoor autumn group work" },
  { filename: "20220825_project_seed_student_activity_in_colab_019.JPG", mood: "discussion", label: "Three at maker table" },
  { filename: "019313_noor_015.jpg", mood: "discussion", label: "Two students, laptop, peer collaboration" },

  // Focused attention
  { filename: "002418_winter_session_law091.jpg", mood: "focus", label: "Listener in red scarf" },
  { filename: "20250306_canelas069.JPG", mood: "focus", label: "Pensive pair looking up" },

  // Teaching
  { filename: "023217_martin_smith_teaching097.jpg", mood: "teaching", label: "Instructor mid-gesture with marker" },

  // Atmospheric & place
  { filename: "20241213_gothicrrfinals055.JPG", mood: "place", label: "Gothic reading room" },
  { filename: "126314_law_library002.jpg", mood: "place", label: "Overhead study table" },
  { filename: "20211112_fall_pond002.jpg", mood: "place", label: "Autumn pond" },

  // Object & abstract
  { filename: "20230111_fdoceast023.JPG", mood: "object", label: "Hands on iPad, math in blue" },
  { filename: "20190815_baldwin_aerial004.jpg", mood: "object", label: "Octagonal dome aerial" },
  { filename: "20200925_quantum_computing_lab_052.jpg", mood: "object", label: "Glowing optics cube" },

  // Scholarly exchange
  { filename: "052114_visible_thinking_0099.jpg", mood: "scholarly", label: "Poster session" },
]

export const COVER_MOOD_ORDER: CoverMood[] = [
  "discussion",
  "focus",
  "teaching",
  "place",
  "object",
  "scholarly",
]
