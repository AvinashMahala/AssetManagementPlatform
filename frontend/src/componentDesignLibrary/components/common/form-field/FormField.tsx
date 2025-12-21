import * as React from "react"
import { cn } from "../../../../lib/utils"
import type { FormFieldProps } from "./types"

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ children, label, required, className, id, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        {children}
      </div>
    )
  }
)
FormField.displayName = "FormField"

export { FormField }