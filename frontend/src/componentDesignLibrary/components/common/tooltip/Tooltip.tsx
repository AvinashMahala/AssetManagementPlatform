import React, { useState, useEffect, useRef } from "react"
import type { TooltipProps } from "./types"

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  delay = 300,
  className,
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<number | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const showTooltip = () => {
    if (disabled) return
    const id = window.setTimeout(() => setIsVisible(true), delay)
    setTimeoutId(id)
  }

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timeoutId])

  const getTooltipPosition = () => {
    if (!tooltipRef.current || !triggerRef.current) return {}

    const tooltip = tooltipRef.current.getBoundingClientRect()
    const trigger = triggerRef.current.getBoundingClientRect()

    switch (position) {
      case "top":
        return {
          top: -tooltip.height - 8,
          left: (trigger.width - tooltip.width) / 2,
        }
      case "bottom":
        return {
          top: trigger.height + 8,
          left: (trigger.width - tooltip.width) / 2,
        }
      case "left":
        return {
          top: (trigger.height - tooltip.height) / 2,
          left: -tooltip.width - 8,
        }
      case "right":
        return {
          top: (trigger.height - tooltip.height) / 2,
          left: trigger.width + 8,
        }
      default:
        return {}
    }
  }

  if (disabled) {
    return <>{children}</>
  }

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="cursor-help"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-sm whitespace-nowrap dark:bg-gray-700 ${className}`}
          style={getTooltipPosition()}
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45 ${
              position === "top"
                ? "bottom-[-4px] left-1/2 -translate-x-1/2"
                : position === "bottom"
                ? "top-[-4px] left-1/2 -translate-x-1/2"
                : position === "left"
                ? "right-[-4px] top-1/2 -translate-y-1/2"
                : "left-[-4px] top-1/2 -translate-y-1/2"
            }`}
          />
        </div>
      )}
    </div>
  )
}