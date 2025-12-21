import React, { useState, useEffect } from "react"
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  RefreshCw,
  Mail,
} from "lucide-react"
import { cn } from "../../../../lib/utils"
import { Button } from "../button"
import type {
  ValidationFeedbackProps,
  EmailVerificationStatusProps,
  RetryButtonProps,
} from "./types"

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  type,
  message,
  className,
  onDismiss,
  autoHide = false,
  autoHideDelay = 5000,
}) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (autoHide && visible) {
      const timer = setTimeout(() => {
        setVisible(false)
        onDismiss?.()
      }, autoHideDelay)
      return () => clearTimeout(timer)
    }
  }, [autoHide, autoHideDelay, visible, onDismiss])

  if (!visible) return null

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
      case "warning":
        return (
          <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
        )
      case "info":
        return <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
      case "error":
        return "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300"
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
    }
  }

  return (
    <div
      className={cn(
        "flex items-start space-x-3 p-4 border rounded-lg transition-all duration-300",
        getStyles(),
        className
      )}
    >
      {getIcon()}
      <div className="flex-1 text-sm font-medium">{message}</div>
      {onDismiss && (
        <button
          onClick={() => {
            setVisible(false)
            onDismiss()
          }}
          className="text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export const EmailVerificationStatus: React.FC<EmailVerificationStatusProps> = ({
  isVerified,
  email,
  onResendVerification,
  loading = false,
  className,
}) => {
  if (isVerified) {
    return (
      <div
        className={cn(
          "flex items-center space-x-2 text-sm text-green-600 dark:text-green-400",
          className
        )}
      >
        <CheckCircle className="h-4 w-4" />
        <span>Email verified ({email})</span>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center space-x-2 text-sm text-yellow-600 dark:text-yellow-400">
        <AlertTriangle className="h-4 w-4" />
        <span>Email not verified ({email})</span>
      </div>
      {onResendVerification && (
        <Button
          variant="outline"
          size="sm"
          onClick={onResendVerification}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Mail className="h-4 w-4 mr-2" />
          )}
          Resend Verification Email
        </Button>
      )}
    </div>
  )
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  loading = false,
  message = "Something went wrong. Please try again.",
  className,
}) => (
  <div className={cn("text-center space-y-3", className)}>
    <ValidationFeedback type="error" message={message} autoHide={false} />
    <Button onClick={onRetry} disabled={loading}>
      {loading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
      Try Again
    </Button>
  </div>
)

// Real-time validation hook
export const useRealTimeValidation = (
  initialValue = "",
  validator?: (value: string) => string | null
) => {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  const validate = (newValue: string) => {
    if (validator) {
      const validationError = validator(newValue)
      setError(validationError)
      return !validationError
    }
    return true
  }

  const handleChange = (newValue: string) => {
    setValue(newValue)
    if (touched) {
      validate(newValue)
    }
  }

  const handleBlur = () => {
    setTouched(true)
    validate(value)
  }

  return {
    value,
    error,
    touched,
    isValid: !error,
    handleChange,
    handleBlur,
    setValue,
    validate: () => validate(value),
  }
}