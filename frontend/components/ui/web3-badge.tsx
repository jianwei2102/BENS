import { cn } from "@/lib/utils"
import { Badge, type BadgeProps } from "@/components/ui/badge"

export function Web3Badge({ className, ...props }: BadgeProps) {
  return (
    <Badge
      className={cn(
        "bg-gradient-to-r from-primary/20 to-secondary/20 text-primary hover:from-primary/30 hover:to-secondary/30",
        className,
      )}
      {...props}
    />
  )
}

