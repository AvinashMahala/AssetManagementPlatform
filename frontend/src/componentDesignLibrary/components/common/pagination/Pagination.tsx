import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../../../lib/utils"
import { Button } from "../button"
import type { PaginationProps } from "./types"

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({
    currentPage,
    totalPages,
    onPageChange,
    showFirstLast = true,
    maxVisiblePages = 5,
    className,
    ...props
  }, ref) => {
    const getVisiblePages = () => {
      const delta = Math.floor(maxVisiblePages / 2)
      let start = Math.max(1, currentPage - delta)
      let end = Math.min(totalPages, start + maxVisiblePages - 1)

      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1)
      }

      return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    }

    const visiblePages = getVisiblePages()
    const showStartEllipsis = visiblePages[0] > 2
    const showEndEllipsis = visiblePages[visiblePages.length - 1] < totalPages - 1

    if (totalPages <= 1) return null

    return (
      <nav
        ref={ref}
        className={cn("flex items-center space-x-1", className)}
        {...props}
      >
        {/* First button */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="hidden sm:flex"
          >
            First
          </Button>
        )}

        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous</span>
        </Button>

        {/* Start ellipsis */}
        {showStartEllipsis && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
            >
              1
            </Button>
            <span className="px-2 text-muted-foreground">...</span>
          </>
        )}

        {/* Page numbers */}
        {visiblePages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}

        {/* End ellipsis */}
        {showEndEllipsis && (
          <>
            <span className="px-2 text-muted-foreground">...</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <span className="sr-only">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last button */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="hidden sm:flex"
          >
            Last
          </Button>
        )}
      </nav>
    )
  }
)
Pagination.displayName = "Pagination"

export { Pagination }