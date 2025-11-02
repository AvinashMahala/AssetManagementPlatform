import React from 'react';
import { UI_COLORS, UI_SPACING, UI_BORDER_RADIUS, UI_SHADOWS } from '../../constants/ui';
import type { BaseComponentProps } from '../../types/common';

interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  padding?: string;
  shadow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  actions,
  children,
  style,
  padding = UI_SPACING.MD,
  shadow = true,
  testId,
  ...props
}) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: UI_COLORS.WHITE,
    borderRadius: UI_BORDER_RADIUS.LG,
    boxShadow: shadow ? UI_SHADOWS.MD : 'none',
    border: `1px solid #e9ecef`,
    overflow: 'hidden',
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    padding: padding,
    borderBottom: title || subtitle ? '1px solid #e9ecef' : 'none',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#495057',
  };

  const subtitleStyle: React.CSSProperties = {
    margin: '0.25rem 0 0 0',
    fontSize: '0.875rem',
    color: '#6c757d',
  };

  const bodyStyle: React.CSSProperties = {
    padding: padding,
  };

  return (
    <div style={cardStyle} data-testid={testId} {...props}>
      {(title || subtitle || actions) && (
        <div style={headerStyle}>
          <div>
            {title && <h3 style={titleStyle}>{title}</h3>}
            {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div style={bodyStyle}>
        {children}
      </div>
    </div>
  );
};