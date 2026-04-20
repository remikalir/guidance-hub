import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ReviewerRole, ItemType } from "@prisma/client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const REVIEWER_ROLE_LABELS: Record<ReviewerRole, string> = {
  DISCIPLINARY_EXPERT: "Disciplinary Expert",
  ETHICIST: "Ethicist",
  PRIVACY_SPECIALIST: "Privacy Specialist",
  LEARNING_SCIENTIST: "Learning Scientist",
  TECHNICAL_EXPERT: "Technical Expert",
  RESEARCHER: "Researcher",
  OTHER: "Other",
}

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  ASSIGNMENT: "Assignment",
  RESOURCE: "Resource",
  TOOL: "Tool",
  SYLLABUS_LANGUAGE: "Syllabus Language",
  TEMPLATE: "Template",
  CASE_STUDY: "Case Study",
  TOOLKIT: "Toolkit",
}

export const COMMUNITY_TYPES: ItemType[] = ["ASSIGNMENT", "RESOURCE", "TOOL"]
export const GUIDANCE_TYPES: ItemType[] = ["SYLLABUS_LANGUAGE", "TEMPLATE", "CASE_STUDY", "TOOLKIT"]

export const CRITERIA_LABELS = [
  { key: "studentAgency", label: "Student Agency" },
  { key: "biasMitigation", label: "Bias Mitigation" },
  { key: "dataSecurity", label: "Data Security" },
  { key: "accessibility", label: "Accessibility" },
  { key: "studentLearning", label: "Student Learning" },
] as const

export type CriterionKey = (typeof CRITERIA_LABELS)[number]["key"]

export function computeOverallAverage(scores: {
  studentAgency: number | null
  biasMitigation: number | null
  dataSecurity: number | null
  accessibility: number | null
  studentLearning: number | null
}): number | null {
  const values = [
    scores.studentAgency,
    scores.biasMitigation,
    scores.dataSecurity,
    scores.accessibility,
    scores.studentLearning,
  ].filter((v): v is number => v !== null)

  if (values.length === 0) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}
