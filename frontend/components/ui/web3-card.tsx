import { cn } from "@/lib/utils"
import type React from "react"

interface Web3CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowing?: boolean
  hoverable?: boolean
}

export function Web3Card({ children, className, glowing = false, hoverable = true, ...props }: Web3CardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-gray-200 bg-white/90 backdrop-blur-sm transition-all dark:border-gray-800 dark:bg-gray-950/70",
        hoverable && "hover:shadow-lg",
        glowing && "animate-glow",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-mesh opacity-50" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

