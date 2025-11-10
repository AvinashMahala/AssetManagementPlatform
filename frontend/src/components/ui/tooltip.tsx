import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 300,
  className,
  disabled = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (disabled) return;
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const getTooltipPosition = () => {
    if (!tooltipRef.current || !triggerRef.current) return {};

    const tooltip = tooltipRef.current.getBoundingClientRect();
    const trigger = triggerRef.current.getBoundingClientRect();

    switch (position) {
      case 'top':
        return {
          top: trigger.top - tooltip.height - 8,
          left: trigger.left + (trigger.width / 2) - (tooltip.width / 2),
        };
      case 'bottom':
        return {
          top: trigger.bottom + 8,
          left: trigger.left + (trigger.width / 2) - (tooltip.width / 2),
        };
      case 'left':
        return {
          top: trigger.top + (trigger.height / 2) - (tooltip.height / 2),
          left: trigger.left - tooltip.width - 8,
        };
      case 'right':
        return {
          top: trigger.top + (trigger.height / 2) - (tooltip.height / 2),
          left: trigger.right + 8,
        };
      default:
        return {};
    }
  };

  if (disabled) {
    return <>{children}</>;
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
          className={cn(
            "fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg max-w-xs text-center whitespace-nowrap pointer-events-none transition-opacity duration-200",
            "before:content-[''] before:absolute before:w-2 before:h-2 before:bg-gray-900 dark:before:bg-gray-700 before:rotate-45",
            position === 'top' && "before:-bottom-1 before:left-1/2 before:-translate-x-1/2 before:top-auto",
            position === 'bottom' && "before:-top-1 before:left-1/2 before:-translate-x-1/2 before:bottom-auto",
            position === 'left' && "before:-right-1 before:top-1/2 before:-translate-y-1/2 before:left-auto",
            position === 'right' && "before:-left-1 before:top-1/2 before:-translate-y-1/2 before:right-auto",
            className
          )}
          style={getTooltipPosition()}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
};