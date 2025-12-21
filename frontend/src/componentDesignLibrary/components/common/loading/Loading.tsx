import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "../../../../lib/utils"
import type { SpinnerProps, LoadingProps } from "./types"

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
    }

    return (
      <div
        ref={ref}
        className={cn("animate-spin", sizeClasses[size], className)}
        {...props}
      >
        <Loader2 className="h-full w-full" />
      </div>
    )
  }
)
Spinner.displayName = "Spinner"

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size = "md", text, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center", className)}
        {...props}
      >
        <Spinner size={size} className="mr-2" />
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>
    )
  }
)
Loading.displayName = "Loading"

export { Spinner, Loading }