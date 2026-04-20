"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReviewerRole } from "@prisma/client"
import { createReviewSchema, CreateReviewInput } from "@/lib/validations"
import { REVIEWER_ROLE_LABELS, CRITERIA_LABELS } from "@/lib/utils"
import { StarRating } from "./StarRating"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

interface ReviewFormProps {
  itemId: string
  hasReviewed: boolean
}

export function ReviewForm({ itemId, hasReviewed }: ReviewFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateReviewInput>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      studentAgency: 0,
      biasMitigation: 0,
      dataSecurity: 0,
      accessibility: 0,
      studentLearning: 0,
      comment: "",
    },
  })

  const selectedRole = watch("role")

  if (hasReviewed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <p className="text-green-700 text-sm font-medium">
          You have already submitted a review for this item.
        </p>
      </div>
    )
  }

  const onSubmit = async (data: CreateReviewInput) => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/items/${itemId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? "Failed to submit review")
        return
      }

      router.refresh()
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {step === 1 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">
            Step 1: Select your role
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Choose the perspective from which you are reviewing this item.
          </p>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(REVIEWER_ROLE_LABELS).map(([value, label]) => (
                  <label
                    key={value}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors text-sm",
                      field.value === value
                        ? "border-duke-blue bg-duke-blue/5 text-duke-blue font-medium"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    )}
                  >
                    <input
                      type="radio"
                      value={value}
                      checked={field.value === value}
                      onChange={() => field.onChange(value as ReviewerRole)}
                      className="sr-only"
                    />
                    {label}
                  </label>
                ))}
              </div>
            )}
          />
          {errors.role && (
            <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
          )}
          <div className="mt-4">
            <Button
              type="button"
              onClick={() => setStep(2)}
              disabled={!selectedRole}
            >
              Continue to Rating
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-duke-blue hover:underline"
            >
              ← Back
            </button>
            <span className="text-sm text-gray-500">
              Reviewing as: <strong>{REVIEWER_ROLE_LABELS[selectedRole]}</strong>
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 mb-1">
            Step 2: Rate each criterion
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Rate each dimension from 1 (poor) to 5 (excellent).
          </p>

          <div className="space-y-4">
            {CRITERIA_LABELS.map(({ key, label }) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <Controller
                  control={control}
                  name={key}
                  render={({ field }) => (
                    <div>
                      <StarRating
                        value={field.value}
                        onChange={field.onChange}
                        name={key}
                        size="md"
                      />
                      {errors[key] && (
                        <p className="text-red-500 text-xs mt-0.5 text-right">
                          Required
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comments{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <Controller
              control={control}
              name="comment"
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={3}
                  placeholder="Share any additional thoughts..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-duke-blue/30 focus:border-duke-blue resize-none"
                />
              )}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="mt-4">
            <Button type="submit" loading={submitting}>
              Submit Review
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}
