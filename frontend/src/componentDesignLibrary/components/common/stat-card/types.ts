import * as React from "react"

export interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ComponentType<{ className?: string }>
  trend?: "up" | "down"
  description?: string
  action?: () => void
  actionLabel?: string
}