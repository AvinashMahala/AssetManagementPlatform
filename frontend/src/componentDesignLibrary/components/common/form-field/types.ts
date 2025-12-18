import * as React from "react"

export interface FormFieldProps {
  children: React.ReactNode
  label?: string
  required?: boolean
  className?: string
  id?: string
}