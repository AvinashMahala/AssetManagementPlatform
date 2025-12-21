export interface SkeletonProps {
  className?: string
}

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export interface ProgressIndicatorProps {
  progress: number
  className?: string
  showPercentage?: boolean
}