import React from 'react';
import { UI_COLORS, UI_SPACING, UI_BORDER_RADIUS } from '../../constants/ui';
import type { BaseComponentProps } from '../../types/common';

interface InputProps extends BaseComponentProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  style,
  testId,
  ...props
}) => {
  const inputStyle: React.CSSProperties = {
    width: fullWidth ? '100%' : 'auto',
    padding: `${UI_SPACING.SM} ${UI_SPACING.MD}`,
    border: `1px solid ${error ? UI_COLORS.DANGER : '#ced4da'}`,
    borderRadius: UI_BORDER_RADIUS.MD,
    fontSize: '1rem',
    fontFamily: 'inherit',
    backgroundColor: UI_COLORS.WHITE,
    color: '#495057',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    outline: 'none',
    ...style,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: UI_SPACING.XS,
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#495057',
  };

  const errorStyle: React.CSSProperties = {
    display: 'block',
    marginTop: UI_SPACING.XS,
    fontSize: '0.875rem',
    color: UI_COLORS.DANGER,
  };

  const helperStyle: React.CSSProperties = {
    display: 'block',
    marginTop: UI_SPACING.XS,
    fontSize: '0.875rem',
    color: '#6c757d',
  };

  return (
    <div style={{ marginBottom: UI_SPACING.MD }}>
      {label && (
        <label style={labelStyle} htmlFor={props.id}>
          {label}
        </label>
      )}
      <input
        style={inputStyle}
        data-testid={testId}
        {...props}
      />
      {error && <span style={errorStyle}>{error}</span>}
      {helperText && !error && <span style={helperStyle}>{helperText}</span>}
    </div>
  );
};