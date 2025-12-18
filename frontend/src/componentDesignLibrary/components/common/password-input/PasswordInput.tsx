import React, { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "../../../../lib/utils"
import { Input } from "../input"
import { Button } from "../button"
import type { PasswordStrengthIndicatorProps, PasswordInputProps } from "./types"

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  className,
}) => {
  const [strength, setStrength] = useState(0)
  const [feedback, setFeedback] = useState<string[]>([])

  useEffect(() => {
    if (!password) {
      setStrength(0)
      setFeedback([])
      return
    }

    let score = 0
    const checks = []

    // Length check
    if (password.length >= 8) {
      score += 1
      checks.push("At least 8 characters")
    } else {
      checks.push("At least 8 characters")
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1
      checks.push("One uppercase letter")
    } else {
      checks.push("One uppercase letter")
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1
      checks.push("One lowercase letter")
    } else {
      checks.push("One lowercase letter")
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1
      checks.push("One number")
    } else {
      checks.push("One number")
    }

    // Special character check
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1
      checks.push("One special character")
    } else {
      checks.push("One special character")
    }

    setStrength(score)
    setFeedback(checks)
  }, [password])

  const getStrengthColor = () => {
    if (strength <= 2) return "bg-red-500"
    if (strength <= 3) return "bg-yellow-500"
    if (strength <= 4) return "bg-blue-500"
    return "bg-green-500"
  }

  const getStrengthText = () => {
    if (strength <= 2) return "Weak"
    if (strength <= 3) return "Fair"
    if (strength <= 4) return "Good"
    return "Strong"
  }

  if (!password) return null

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          Password Strength
        </span>
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {getStrengthText()}
        </span>
      </div>
      <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300", getStrengthColor())}
          style={{ width: `${(strength / 5) * 100}%` }}
        />
      </div>
      <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mt-2">
        {feedback.map((item, index) => (
          <li key={index} className="flex items-center">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full mr-2",
                password &&
                  ((item === "At least 8 characters" && password.length >= 8) ||
                    (item === "One uppercase letter" && /[A-Z]/.test(password)) ||
                    (item === "One lowercase letter" && /[a-z]/.test(password)) ||
                    (item === "One number" && /\d/.test(password)) ||
                    (item === "One special character" &&
                      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)))
                  ? "bg-green-500"
                  : "bg-gray-300 dark:bg-gray-600"
              )}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  name,
  value,
  onChange,
  placeholder = "Enter password",
  error,
  showStrengthIndicator = true,
  className,
}) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn("pr-10", error && "border-red-500 focus:ring-red-500")}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-500" />
          ) : (
            <Eye className="h-4 w-4 text-gray-500" />
          )}
          <span className="sr-only">
            {showPassword ? "Hide password" : "Show password"}
          </span>
        </Button>
      </div>

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

      {showStrengthIndicator && <PasswordStrengthIndicator password={value} />}
    </div>
  )
}