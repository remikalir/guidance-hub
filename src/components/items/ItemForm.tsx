"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import dynamic from "next/dynamic"
import { ItemType } from "@prisma/client"
import { createItemSchema, CreateItemInput } from "@/lib/validations"
import { ITEM_TYPE_LABELS, COMMUNITY_TYPES, GUIDANCE_TYPES } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

const RichTextEditor = dynamic(
  () =>
    import("@/components/editor/RichTextEditor").then((m) => m.RichTextEditor),
  { ssr: false }
)

interface ItemFormProps {
  mode: "create" | "edit"
  initialData?: Partial<CreateItemInput> & { id?: string; lastReviewedAt?: string }
  isCtlStaff?: boolean
}

export function ItemForm({ mode, initialData, isCtlStaff = false }: ItemFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState("")
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([])
  const [fileInfo, setFileInfo] = useState<{ url: string; key: string } | null>(
    initialData?.fileUrl
      ? { url: initialData.fileUrl, key: initialData.fileKey ?? "" }
      : null
  )
  const [uploading, setUploading] = useState(false)
  const [lastReviewedAt, setLastReviewedAt] = useState(initialData?.lastReviewedAt ?? "")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const availableTypes = isCtlStaff ? GUIDANCE_TYPES : COMMUNITY_TYPES

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateItemInput>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      type: initialData?.type ?? (isCtlStaff ? ItemType.SYLLABUS_LANGUAGE : ItemType.ASSIGNMENT),
      externalLink: initialData?.externalLink ?? "",
      tags: initialData?.tags ?? [],
      fileUrl: initialData?.fileUrl ?? "",
      fileKey: initialData?.fileKey ?? "",
    },
  })

  const tags = watch("tags")

  const addTag = (name: string) => {
    const normalised = name.toLowerCase().trim()
    if (normalised && !tags.includes(normalised) && tags.length < 10) {
      setValue("tags", [...tags, normalised])
    }
    setTagInput("")
    setTagSuggestions([])
  }

  const removeTag = (tag: string) => {
    setValue("tags", tags.filter((t) => t !== tag))
  }

  const fetchTagSuggestions = useCallback(async (q: string) => {
    if (!q) return setTagSuggestions([])
    const res = await fetch(`/api/tags?q=${encodeURIComponent(q)}`)
    if (res.ok) setTagSuggestions(await res.json())
  }, [])

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    try {
      const { uploadFiles } = await import("@/lib/uploadthing")
      const results = await uploadFiles("itemAttachment", { files: [file] })
      const uploaded = results[0]
      if (!uploaded) throw new Error("Upload failed")
      const url = uploaded.ufsUrl ?? uploaded.url
      setFileInfo({ url, key: uploaded.key })
      setValue("fileUrl", url)
      setValue("fileKey", uploaded.key)
    } catch (e) {
      setError(e instanceof Error ? e.message : "File upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: CreateItemInput) => {
    setSubmitting(true)
    setError(null)
    try {
      const url =
        mode === "create"
          ? "/api/items"
          : `/api/items/${initialData?.id}`
      const method = mode === "create" ? "POST" : "PATCH"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, lastReviewedAt: lastReviewedAt || null }),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? "Failed to save item")
        return
      }

      const item = await res.json()
      router.push(`/items/${item.id}`)
      router.refresh()

    } catch {
      setError("An unexpected error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          {...register("title")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-duke-blue/30 focus:border-duke-blue"
          placeholder="e.g. AI-Assisted Essay Writing Assignment"
        />
        {errors.title && (
          <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type <span className="text-red-500">*</span>
        </label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <div className="flex gap-3 flex-wrap">
              {availableTypes.map((t) => (
                <label
                  key={t}
                  className={cn(
                    "flex-1 flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors text-sm font-medium",
                    field.value === t
                      ? "border-duke-blue bg-duke-blue/5 text-duke-blue"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  )}
                >
                  <input
                    type="radio"
                    value={t}
                    checked={field.value === t}
                    onChange={() => field.onChange(t)}
                    className="sr-only"
                  />
                  {ITEM_TYPE_LABELS[t]}
                </label>
              ))}
            </div>
          )}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              placeholder="Describe the assignment, resource, or tool..."
            />
          )}
        />
        {errors.description && (
          <p className="text-red-500 text-xs mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* External Link */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          External Link
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </label>
        <input
          {...register("externalLink")}
          type="url"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-duke-blue/30 focus:border-duke-blue"
          placeholder="https://..."
        />
        {errors.externalLink && (
          <p className="text-red-500 text-xs mt-1">
            {errors.externalLink.message}
          </p>
        )}
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          File Attachment
          <span className="text-gray-400 font-normal ml-1">
            (optional — PDF, Word, or image, max 16MB)
          </span>
        </label>
        {fileInfo ? (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-green-700 flex-1 truncate">
              File uploaded
            </span>
            <button
              type="button"
              onClick={() => {
                setFileInfo(null)
                setValue("fileUrl", "")
                setValue("fileKey", "")
              }}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file)
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              loading={uploading}
            >
              {uploading ? "Uploading..." : "Choose File"}
            </Button>
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
          <span className="text-gray-400 font-normal ml-1">(up to 10)</span>
        </label>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-duke-blue/10 text-duke-blue rounded-full text-xs"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-duke-blue hover:text-duke-blue-dark"
                  aria-label={`Remove ${tag} tag`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="relative">
          <input
            value={tagInput}
            onChange={(e) => {
              setTagInput(e.target.value)
              fetchTagSuggestions(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault()
                addTag(tagInput)
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-duke-blue/30 focus:border-duke-blue"
            placeholder="Type a tag and press Enter..."
          />
          {tagSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              {tagSuggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => addTag(s)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Last Reviewed Date — CTL staff only */}
      {isCtlStaff && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Reviewed Date
            <span className="text-gray-400 font-normal ml-1">(optional)</span>
          </label>
          <input
            type="date"
            value={lastReviewedAt}
            onChange={(e) => setLastReviewedAt(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-duke-blue/30 focus:border-duke-blue"
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={submitting}>
          {mode === "create" ? "Submit to Hub" : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
