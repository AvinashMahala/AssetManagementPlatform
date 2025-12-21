import * as React from "react"

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[]
  separator?: React.ComponentType<{ className?: string }>
  homeIcon?: React.ComponentType<{ className?: string }>
}