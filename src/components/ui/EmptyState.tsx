// src/components/ui/EmptyState.tsx — Phase 4c: editorial typography, no emoji
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-14 px-4",
        className
      )}
    >
      <h3 className="font-serif italic text-[22px] text-duke-blue leading-tight">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-[13px] text-muted max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
