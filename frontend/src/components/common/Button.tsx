import React from 'react';
import { UI_COLORS, UI_SPACING, UI_BORDER_RADIUS } from '../../constants/ui';
import type { BaseComponentProps, ButtonVariantType, ButtonSizeType } from '../../types/common';

interface ButtonProps extends BaseComponentProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariantType;
  size?: ButtonSizeType;
  loading?: boolean;
  fullWidth?: boolean;
}

const buttonVariants = {
  primary: {
    backgroundColor: UI_COLORS.PRIMARY,
    color: UI_COLORS.WHITE,
    border: `1px solid ${UI_COLORS.PRIMARY}`,
    hoverBackgroundColor: '#0056b3',
    hoverBorderColor: '#0056b3',
  },
  secondary: {
    backgroundColor: UI_COLORS.SECONDARY,
    color: UI_COLORS.WHITE,
    border: `1px solid ${UI_COLORS.SECONDARY}`,
    hoverBackgroundColor: '#545b62',
    hoverBorderColor: '#545b62',
  },
  danger: {
    backgroundColor: UI_COLORS.DANGER,
    color: UI_COLORS.WHITE,
    border: `1px solid ${UI_COLORS.DANGER}`,
    hoverBackgroundColor: '#c82333',
    hoverBorderColor: '#bd2130',
  },
  success: {
    backgroundColor: UI_COLORS.SUCCESS,
    color: UI_COLORS.WHITE,
    border: `1px solid ${UI_COLORS.SUCCESS}`,
    hoverBackgroundColor: '#218838',
    hoverBorderColor: '#1e7e34',
  },
  warning: {
    backgroundColor: UI_COLORS.WARNING,
    color: '#212529',
    border: `1px solid ${UI_COLORS.WARNING}`,
    hoverBackgroundColor: '#e0a800',
    hoverBorderColor: '#d39e00',
  },
};

const buttonSizes = {
  small: {
    padding: `${UI_SPACING.XS} ${UI_SPACING.SM}`,
    fontSize: '0.875rem',
    borderRadius: UI_BORDER_RADIUS.SM,
  },
  medium: {
    padding: `${UI_SPACING.SM} ${UI_SPACING.MD}`,
    fontSize: '1rem',
    borderRadius: UI_BORDER_RADIUS.MD,
  },
  large: {
    padding: `${UI_SPACING.MD} ${UI_SPACING.LG}`,
    fontSize: '1.125rem',
    borderRadius: UI_BORDER_RADIUS.LG,
  },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  style,
  testId,
  ...props
}) => {
  const variantStyles = buttonVariants[variant];
  const sizeStyles = buttonSizes[size];

  const buttonStyle: React.CSSProperties = {
    ...variantStyles,
    ...sizeStyles,
    border: 'none',
    cursor: loading || disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: UI_SPACING.XS,
    ...style,
  };

  return (
    <button
      style={buttonStyle}
      disabled={disabled || loading}
      data-testid={testId}
      {...props}
    >
      {loading && <span>⟳</span>}
      {loading ? 'Loading...' : children}
    </button>
  );
};