import * as React from "react"

export interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  onSubmit?: (data: Record<string, any>) => void | Promise<void>
  loading?: boolean
  disabled?: boolean
}