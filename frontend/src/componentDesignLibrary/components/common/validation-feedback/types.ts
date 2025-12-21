export interface ValidationFeedbackProps {
  type: "success" | "error" | "warning" | "info"
  message: string
  className?: string
  onDismiss?: () => void
  autoHide?: boolean
  autoHideDelay?: number
}

export interface EmailVerificationStatusProps {
  isVerified: boolean
  email: string
  onResendVerification?: () => void
  loading?: boolean
  className?: string
}

export interface RetryButtonProps {
  onRetry: () => void
  loading?: boolean
  message?: string
  className?: string
}