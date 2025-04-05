import { cn } from "@/lib/utils";
import { Input, type InputProps } from "@/components/ui/input";

interface Web3InputProps extends InputProps {
  suffix?: string;
  icon?: React.ReactNode;
}

export function Web3Input({
  className,
  suffix,
  icon,
  ...props
}: Web3InputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
      )}
      <Input
        className={cn(
          "px-4 py-2.5 w-full",
          "bg-gray-100/10 border border-gray-700",
          "rounded-lg",
          "text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
          "transition-all duration-200",
          icon && "pl-10",
          suffix && "pr-16",
          // Remove number input spinners
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          className
        )}
        {...props}
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {suffix}
        </div>
      )}
    </div>
  );
}
