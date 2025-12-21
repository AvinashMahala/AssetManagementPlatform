export interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
}

export interface PasswordInputProps {
  name: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  showStrengthIndicator?: boolean
  className?: string
}