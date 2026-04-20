import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "blue" | "green" | "purple" | "orange"
  className?: string
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-gray-100 text-gray-700",
        variant === "blue" && "bg-duke-blue/10 text-duke-blue",
        variant === "green" && "bg-green-100 text-green-700",
        variant === "purple" && "bg-purple-100 text-purple-700",
        variant === "orange" && "bg-orange-100 text-orange-700",
        className
      )}
    >
      {children}
    </span>
  )
}
