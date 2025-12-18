import * as React from "react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  success?: boolean
  loading?: boolean
  helperText?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}