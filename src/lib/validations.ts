import { z } from "zod"
import { ItemType, ReviewerRole } from "@prisma/client"

export const createItemSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.nativeEnum(ItemType),
  externalLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tags: z.array(z.string().min(1).max(50)).max(10, "Maximum 10 tags"),
  fileUrl: z.string().optional(),
  fileKey: z.string().optional(),
})

export const updateItemSchema = createItemSchema.partial()

export const createReviewSchema = z.object({
  role: z.nativeEnum(ReviewerRole),
  studentAgency: z.number().int().min(1).max(5),
  biasMitigation: z.number().int().min(1).max(5),
  dataSecurity: z.number().int().min(1).max(5),
  accessibility: z.number().int().min(1).max(5),
  studentLearning: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional().or(z.literal("")),
})

export type CreateItemInput = z.infer<typeof createItemSchema>
export type CreateReviewInput = z.infer<typeof createReviewSchema>
