import React from "react"
import { cn } from "../../../../lib/utils"
import type {
  SkeletonProps,
  LoadingSpinnerProps,
  ProgressIndicatorProps,
} from "./types"

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]",
        className
      )}
      style={{
        animation: "shimmer 1.5s ease-in-out infinite",
      }}
    />
  )
}

// Profile-specific skeleton components
export const ProfileAvatarSkeleton: React.FC<SkeletonProps> = ({
  className,
}) => (
  <div className={cn("flex flex-col items-center space-y-4", className)}>
    <Skeleton className="h-32 w-32 rounded-full" />
    <div className="space-y-2 w-full max-w-xs">
      <Skeleton className="h-6 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
    </div>
  </div>
)

export const ProfileStatsSkeleton: React.FC<SkeletonProps> = ({
  className,
}) => (
  <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3", className)}>
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
      >
        <Skeleton className="h-8 w-12 mx-auto mb-2" />
        <Skeleton className="h-3 w-16 mx-auto" />
      </div>
    ))}
  </div>
)

export const ProfileCardSkeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn("space-y-4", className)}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-8 w-20" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  </div>
)

export const FormSkeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn("space-y-4", className)}>
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <Skeleton className="h-10 w-32 mt-6" />
  </div>
)

export const ButtonSkeleton: React.FC<SkeletonProps> = ({ className }) => (
  <Skeleton className={cn("h-12 w-full", className)} />
)

// Loading spinner component
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
        sizeClasses[size],
        className
      )}
    />
  )
}

// Progress indicator component
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  className,
  showPercentage = true,
}) => (
  <div className={cn("w-full", className)}>
    <div className="flex justify-between mb-1">
      {showPercentage && (
        <span className="text-sm font-medium text-blue-700 dark:text-white">
          {Math.round(progress)}%
        </span>
      )}
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
      <div
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      ></div>
    </div>
  </div>
)