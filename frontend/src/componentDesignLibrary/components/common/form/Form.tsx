import * as React from "react"
import { cn } from "../../../../lib/utils"
import type { FormProps } from "./types"

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, onSubmit, loading, disabled, children, ...props }, ref) => {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (onSubmit) {
      const formData = new FormData(event.currentTarget)
      const data: Record<string, any> = {}

      for (const [key, value] of formData.entries()) {
        data[key] = value
      }

      await onSubmit(data)
    }
  }

  return (
    <form
      ref={ref}
      className={cn("", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <fieldset disabled={disabled || loading} className="space-y-4">
        {children}
      </fieldset>
    </form>
  )
})
Form.displayName = "Form"

export { Form }