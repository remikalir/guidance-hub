import { ItemType } from "@prisma/client"
import { Badge } from "@/components/ui/Badge"
import { ITEM_TYPE_LABELS } from "@/lib/utils"

const variantMap: Record<ItemType, "blue" | "green" | "purple" | "orange" | "default"> = {
  ASSIGNMENT: "blue",
  RESOURCE: "green",
  TOOL: "purple",
  SYLLABUS_LANGUAGE: "orange",
  TEMPLATE: "orange",
  CASE_STUDY: "orange",
  TOOLKIT: "orange",
}

export function ItemTypeBadge({ type }: { type: ItemType }) {
  return <Badge variant={variantMap[type]}>{ITEM_TYPE_LABELS[type]}</Badge>
}
