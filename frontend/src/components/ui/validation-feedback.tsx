import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Mail, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

interface ValidationFeedbackProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  className?: string;
  onDismiss?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  type,
  message,
  className,
  onDismiss,
  autoHide = false,
  autoHideDelay = 5000
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoHide && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, visible, onDismiss]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300';
    }
  };

  return (
    <div className={cn(
      "flex items-start space-x-3 p-4 border rounded-lg transition-all duration-300",
      getStyles(),
      className
    )}>
      {getIcon()}
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={() => {
            setVisible(false);
            onDismiss();
          }}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

interface EmailVerificationStatusProps {
  isVerified: boolean;
  email: string;
  onResendVerification?: () => void;
  loading?: boolean;
  className?: string;
}

export const EmailVerificationStatus: React.FC<EmailVerificationStatusProps> = ({
  isVerified,
  email,
  onResendVerification,
  loading = false,
  className
}) => {
  if (isVerified) {
    return (
      <div className={cn(
        "flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300",
        className
      )}>
        <CheckCircle className="h-5 w-5 text-green-500" />
        <div className="flex-1">
          <p className="text-sm font-medium">Email Verified</p>
          <p className="text-xs text-green-600 dark:text-green-400">{email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "space-y-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300",
      className
    )}>
      <div className="flex items-center space-x-3">
        <AlertCircle className="h-5 w-5 text-yellow-500" />
        <div className="flex-1">
          <p className="text-sm font-medium">Email Not Verified</p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            Please verify your email address to access all features
          </p>
        </div>
      </div>

      {onResendVerification && (
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-yellow-500" />
          <span className="text-xs">{email}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onResendVerification}
            disabled={loading}
            className="ml-auto h-7 px-2 text-xs"
          >
            {loading ? (
              <RefreshCw className="h-3 w-3 animate-spin mr-1" />
            ) : null}
            Resend
          </Button>
        </div>
      )}
    </div>
  );
};

interface RetryButtonProps {
  onRetry: () => void;
  loading?: boolean;
  message?: string;
  className?: string;
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  loading = false,
  message = "Something went wrong. Please try again.",
  className
}) => (
  <div className={cn("text-center space-y-3", className)}>
    <ValidationFeedback
      type="error"
      message={message}
      autoHide={false}
    />
    <Button
      onClick={onRetry}
      disabled={loading}
      variant="outline"
      className="flex items-center space-x-2"
    >
      {loading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      <span>Try Again</span>
    </Button>
  </div>
);

// Real-time validation hook
export const useRealTimeValidation = (initialValue = '', validator?: (value: string) => string | null) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const validate = (newValue: string) => {
    if (validator) {
      const validationError = validator(newValue);
      setError(validationError);
      return !validationError;
    }
    return true;
  };

  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (touched) {
      validate(newValue);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    validate(value);
  };

  return {
    value,
    error,
    touched,
    isValid: !error,
    handleChange,
    handleBlur,
    setValue,
    validate: () => validate(value)
  };
};