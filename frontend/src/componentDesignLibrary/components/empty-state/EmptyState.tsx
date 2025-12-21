import React from 'react';
import { Button } from '../common/button';
import { FileX, Search, Database, Plus } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  };
  variant?: 'default' | 'search' | 'error' | 'success';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const defaultIcons = {
  default: <Database className="h-12 w-12" />,
  search: <Search className="h-12 w-12" />,
  error: <FileX className="h-12 w-12" />,
  success: <Plus className="h-12 w-12" />
};

const sizeClasses = {
  sm: 'py-8',
  md: 'py-12',
  lg: 'py-16'
};

const iconColors = {
  default: 'text-muted-foreground',
  search: 'text-blue-500',
  error: 'text-red-500',
  success: 'text-green-500'
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  className = '',
  size = 'md'
}: EmptyStateProps) {
  const displayIcon = icon || defaultIcons[variant];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizeClasses[size]} ${className}`}>
      <div className={`mb-4 ${iconColors[variant]}`}>
        {displayIcon}
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
      )}

      <div className="flex gap-3">
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || 'default'}
            className="flex items-center gap-2"
          >
            {action.icon}
            {action.label}
          </Button>
        )}

        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            variant={secondaryAction.variant || 'outline'}
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}

export default EmptyState;