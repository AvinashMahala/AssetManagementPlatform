import React, { useState, useEffect } from 'react';
import { Check, X, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  className
}) => {
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setFeedback([]);
      return;
    }

    let score = 0;
    const checks = [];

    // Length check
    if (password.length >= 8) {
      score += 1;
      checks.push('At least 8 characters');
    } else {
      checks.push('At least 8 characters');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
      checks.push('One uppercase letter');
    } else {
      checks.push('One uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
      checks.push('One lowercase letter');
    } else {
      checks.push('One lowercase letter');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
      checks.push('One number');
    } else {
      checks.push('One number');
    }

    // Special character check
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1;
      checks.push('One special character');
    } else {
      checks.push('One special character');
    }

    setStrength(score);
    setFeedback(checks);
  }, [password]);

  const getStrengthColor = () => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={cn("h-2 rounded-full transition-all duration-300", getStrengthColor())}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
        <span className={cn("text-sm font-medium", {
          'text-red-600 dark:text-red-400': strength <= 2,
          'text-yellow-600 dark:text-yellow-400': strength === 3,
          'text-blue-600 dark:text-blue-400': strength === 4,
          'text-green-600 dark:text-green-400': strength === 5,
        })}>
          {getStrengthText()}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-1 text-xs">
        {feedback.map((item, index) => (
          <div key={index} className="flex items-center space-x-1">
            {index < strength ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="h-3 w-3 text-gray-400" />
            )}
            <span className={index < strength ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface PasswordInputProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  showStrengthIndicator?: boolean;
  className?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  name,
  value,
  onChange,
  placeholder = "Enter password",
  error,
  showStrengthIndicator = true,
  className
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white",
            error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
          )}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {showStrengthIndicator && (
        <PasswordStrengthIndicator password={value} />
      )}
    </div>
  );
};