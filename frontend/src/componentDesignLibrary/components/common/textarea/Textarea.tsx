import * as React from "react"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { cn } from "../../../../lib/utils"
import type { TextareaProps } from "./types"

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    error,
    success,
    loading,
    helperText,
    disabled,
    ...props
  }, ref) => {
    const hasError = !!error
    const hasSuccess = success && !hasError
    const isLoading = loading && !disabled

    return (
      <div className="space-y-1">
        <div className="relative">
          <textarea
            className={cn(
              "flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              (hasError || hasSuccess || isLoading) && "pr-10",
              hasError && "border-destructive focus-visible:ring-destructive",
              hasSuccess && "border-green-500 focus-visible:ring-green-500",
              className
            )}
            ref={ref}
            disabled={disabled || isLoading}
            {...props}
          />

          {isLoading && (
            <div className="absolute right-3 top-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && hasError && (
            <div className="absolute right-3 top-3">
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
          )}

          {!isLoading && hasSuccess && (
            <div className="absolute right-3 top-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p className={cn(
            "text-sm",
            hasError && "text-destructive",
            !hasError && "text-muted-foreground"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }