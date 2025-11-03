import * as React from "react"
import { Check, AlertCircle, Loader2 } from "lucide-react"

import { cn } from "../../lib/utils"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onCheckedChange?: (checked: boolean) => void
  error?: string
  loading?: boolean
  helperText?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({
    className,
    onCheckedChange,
    error,
    loading,
    helperText,
    disabled,
    ...props
  }, ref) => {
    const hasError = !!error
    const isLoading = loading && !disabled

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(event.target.checked)
      props.onChange?.(event)
    }

    return (
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="checkbox"
              ref={ref}
              className={cn(
                "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
                hasError && "border-destructive focus-visible:ring-destructive",
                className
              )}
              onChange={handleChange}
              disabled={disabled || isLoading}
              {...props}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              ) : (
                <Check className="h-3 w-3 text-primary-foreground opacity-0 peer-checked:opacity-100" />
              )}
            </div>
          </div>

          {props.children && (
            <label
              htmlFor={props.id}
              className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                hasError && "text-destructive"
              )}
            >
              {props.children}
            </label>
          )}
        </div>

        {(error || helperText) && (
          <div className="flex items-center space-x-1">
            {hasError && <AlertCircle className="h-3 w-3 text-destructive" />}
            <p className={cn(
              "text-sm",
              hasError && "text-destructive",
              !hasError && "text-muted-foreground"
            )}>
              {error || helperText}
            </p>
          </div>
        )}
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }