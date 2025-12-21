import * as React from "react"

export interface TooltipProps {
  content: string
  children: React.ReactNode
  position?: "top" | "bottom" | "left" | "right"
  delay?: number
  className?: string
  disabled?: boolean
}