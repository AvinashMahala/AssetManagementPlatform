import * as React from "react"
import { cn } from "../../../../lib/utils"
import type { InputProps } from "./types"

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type,
    error,
    success,
    loading,
    helperText,
    startIcon,
    endIcon,
    disabled,
    ...props
  }, ref) => {
    const hasError = !!error
    const hasSuccess = success && !hasError
    const isLoading = loading && !disabled

    return (
      <div className="space-y-1">
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {startIcon}
            </div>
          )}

          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              startIcon && "pl-10",
              (endIcon || hasError || hasSuccess || isLoading) && "pr-10",
              hasError && "border-red-500 dark:border-red-400 focus-visible:ring-red-500 dark:focus-visible:ring-red-400",
              hasSuccess && "border-green-500 focus-visible:ring-green-500",
              isLoading && "pr-10",
              className
            )}
            ref={ref}
            disabled={disabled || isLoading}
            {...props}
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            {isLoading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            )}
            {!isLoading && hasError && (
              <div className="h-4 w-4 text-red-500">!</div>
            )}
            {!isLoading && hasSuccess && (
              <div className="h-4 w-4 text-green-500">✓</div>
            )}
            {!isLoading && !hasError && !hasSuccess && endIcon && (
              <div className="text-muted-foreground">{endIcon}</div>
            )}
          </div>
        </div>
        {helperText && !error && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
        {error && (
          <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }