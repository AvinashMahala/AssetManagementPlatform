import React, { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "../../../../lib/utils"
import { Button } from "../button"
import type { ExpandableSectionProps } from "./types"

export const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  children,
  defaultExpanded = false,
  className,
  headerClassName,
  contentClassName,
  showToggleButton = false,
  toggleButtonText = { expand: "Show Details", collapse: "Hide Details" },
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div
      className={cn(
        "border border-gray-200 dark:border-gray-700 rounded-lg",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
          headerClassName
        )}
        onClick={toggleExpanded}
      >
        <div className="flex items-center space-x-3">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          )}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>

        {showToggleButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              toggleExpanded()
            }}
            className="text-sm"
          >
            {isExpanded ? toggleButtonText.collapse : toggleButtonText.expand}
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className={cn("px-4 pb-4", contentClassName)}>{children}</div>
      )}
    </div>
  )
}