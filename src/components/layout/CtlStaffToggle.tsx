"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

interface CtlStaffToggleProps {
  userId: string
  isCtlStaff: boolean
}

export function CtlStaffToggle({ userId, isCtlStaff: initial }: CtlStaffToggleProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isCtlStaff, setIsCtlStaff] = useState(initial)
  const [error, setError] = useState<string | null>(null)

  async function toggle() {
    setError(null)
    const next = !isCtlStaff
    const res = await fetch(`/api/users/${userId}/ctl-staff`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCtlStaff: next }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data?.error ?? "Failed to update CTL staff status.")
      return
    }
    setIsCtlStaff(next)
    startTransition(() => router.refresh())
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        className="shrink-0 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:border-duke-blue hover:text-duke-blue transition-colors disabled:opacity-50"
      >
        {isCtlStaff ? "Remove CTL staff" : "Promote to CTL staff"}
      </button>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}
