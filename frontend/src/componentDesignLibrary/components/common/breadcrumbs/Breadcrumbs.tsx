import * as React from "react"
import { ChevronRight, Home } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "../../../../lib/utils"
import type { BreadcrumbsProps, BreadcrumbItem } from "./types"

const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  ({
    className,
    items,
    separator: Separator = ChevronRight,
    homeIcon: HomeIcon = Home,
    ...props
  }, ref) => {
    const location = useLocation()

    // Auto-generate breadcrumbs based on current path if no items provided
    const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbsFromPath(location.pathname)

    if (breadcrumbItems.length === 0) return null

    return (
      <nav
        ref={ref}
        className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}
        {...props}
      >
        <ol className="flex items-center space-x-1">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1
            const Icon = item.icon || (index === 0 ? HomeIcon : undefined)

            return (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <Separator className="h-4 w-4 mx-1 text-muted-foreground/50" />
                )}

                {item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className="flex items-center hover:text-foreground transition-colors"
                  >
                    {Icon && <Icon className="h-4 w-4 mr-1" />}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span className={cn(
                    "flex items-center",
                    isLast ? "text-foreground font-medium" : "text-muted-foreground"
                  )}>
                    {Icon && <Icon className="h-4 w-4 mr-1" />}
                    <span>{item.label}</span>
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    )
  }
)
Breadcrumbs.displayName = "Breadcrumbs"

// Helper function to generate breadcrumbs from path
export function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const pathSegments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: Home }
  ]

  let currentPath = ''

  for (const segment of pathSegments) {
    currentPath += `/${segment}`

    // Skip dashboard since it's already added
    if (segment === 'dashboard') continue

    let label = segment.charAt(0).toUpperCase() + segment.slice(1)

    // Handle dynamic routes
    if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      // UUID - this is a detail page
      const parentSegment = pathSegments[pathSegments.indexOf(segment) - 1]
      if (parentSegment) {
        const parentLabel = parentSegment.charAt(0).toUpperCase() + parentSegment.slice(1)
        label = `${parentLabel} Details`
      }
    } else if (segment === 'create') {
      const parentSegment = pathSegments[pathSegments.indexOf(segment) - 1]
      if (parentSegment) {
        const parentLabel = parentSegment.charAt(0).toUpperCase() + parentSegment.slice(1)
        label = `Create ${parentLabel.slice(0, -1)}` // Remove 's' from plural
      }
    } else if (segment === 'edit') {
      const parentSegment = pathSegments[pathSegments.indexOf(segment) - 1]
      if (parentSegment) {
        const parentLabel = parentSegment.charAt(0).toUpperCase() + parentSegment.slice(1)
        label = `Edit ${parentLabel.slice(0, -1)}` // Remove 's' from plural
      }
    }

    breadcrumbs.push({
      label,
      href: currentPath
    })
  }

  return breadcrumbs
}

export { Breadcrumbs }