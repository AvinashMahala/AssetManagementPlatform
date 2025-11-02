import React from 'react';
import { UI_COLORS, UI_SPACING, UI_BORDER_RADIUS } from '../../constants/ui';
import type { BaseComponentProps } from '../../types/common';

interface BadgeProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'small' | 'medium';
}

const badgeVariants = {
  primary: {
    backgroundColor: UI_COLORS.PRIMARY,
    color: UI_COLORS.WHITE,
  },
  secondary: {
    backgroundColor: UI_COLORS.SECONDARY,
    color: UI_COLORS.WHITE,
  },
  success: {
    backgroundColor: UI_COLORS.SUCCESS,
    color: UI_COLORS.WHITE,
  },
  warning: {
    backgroundColor: UI_COLORS.WARNING,
    color: '#212529',
  },
  danger: {
    backgroundColor: UI_COLORS.DANGER,
    color: UI_COLORS.WHITE,
  },
  outline: {
    backgroundColor: 'transparent',
    color: UI_COLORS.GRAY_900,
    border: `1px solid ${UI_COLORS.GRAY_300}`,
  },
};

const badgeSizes = {
  small: {
    padding: `${UI_SPACING.XS} ${UI_SPACING.SM}`,
    fontSize: '0.75rem',
  },
  medium: {
    padding: `${UI_SPACING.XS} ${UI_SPACING.SM}`,
    fontSize: '0.875rem',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'secondary',
  size = 'medium',
  children,
  className,
  style,
  testId,
  ...props
}) => {
  const variantStyles = badgeVariants[variant];
  const sizeStyles = badgeSizes[size];

  const badgeStyle: React.CSSProperties = {
    ...variantStyles,
    ...sizeStyles,
    borderRadius: UI_BORDER_RADIUS.SM,
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    ...style,
  };

  return (
    <span
      style={badgeStyle}
      className={className}
      data-testid={testId}
      {...props}
    >
      {children}
    </span>
  );
};