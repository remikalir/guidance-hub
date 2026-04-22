// src/components/layout/CtlStaffToggle.tsx — Phase 4c: token alignment
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
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        className="shrink-0 px-4 py-2 border border-rule rounded-full text-[13px] text-muted hover:border-duke-blue hover:text-duke-blue transition-colors disabled:opacity-50"
      >
        {isCtlStaff ? "Remove CTL staff" : "Promote to CTL staff"}
      </button>
      {error && (
        <p className="text-[11px] text-red-600">{error}</p>
      )}
    </div>
  )
}
