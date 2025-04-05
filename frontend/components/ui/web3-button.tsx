import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@/components/ui/button"

interface Web3ButtonProps extends ButtonProps {
  glowing?: boolean
}

export function Web3Button({ children, className, glowing = false, ...props }: Web3ButtonProps) {
  return (
    <Button
      className={cn(
        "relative overflow-hidden bg-gradient-to-r from-primary to-secondary text-white shadow-md transition-all hover:shadow-lg",
        glowing && "animate-glow",
        className,
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 hover:opacity-10" />
    </Button>
  )
}

