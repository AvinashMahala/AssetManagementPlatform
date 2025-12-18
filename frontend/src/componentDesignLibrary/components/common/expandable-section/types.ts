import * as React from "react"

export interface ExpandableSectionProps {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
  className?: string
  headerClassName?: string
  contentClassName?: string
  showToggleButton?: boolean
  toggleButtonText?: {
    expand: string
    collapse: string
  }
}