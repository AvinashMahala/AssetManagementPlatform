import { Card } from '../../../components/ui/card';
import type { AlertCardProps } from './types';
import './AlertCard.scss';

const variantStyles = {
  warning: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800',
  error: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800',
  info: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
};

const textStyles = {
  warning: 'text-amber-900 dark:text-amber-300',
  error: 'text-red-900 dark:text-red-300',
  info: 'text-blue-900 dark:text-blue-300'
};

const messageStyles = {
  warning: 'text-amber-800 dark:text-amber-200',
  error: 'text-red-800 dark:text-red-200',
  info: 'text-blue-800 dark:text-blue-200'
};

export function AlertCard({
  title,
  messages,
  icon,
  variant = 'warning',
  actions,
  className = ''
}: AlertCardProps) {
  if (messages.length === 0) return null;

  return (
    <Card className={`alert-card p-2 ${variantStyles[variant]} ${className}`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          {icon && <div className={textStyles[variant]}>{icon}</div>}
          <span className={`text-sm font-medium ${textStyles[variant]}`}>
            {title}
          </span>
          <div className="flex items-center space-x-4 flex-wrap">
            {messages.map((msg, idx) => (
              <span key={idx} className={`text-sm ${messageStyles[variant]}`}>
                {msg}
              </span>
            ))}
          </div>
        </div>
        {actions && (
          <div className="flex space-x-2">
            {actions}
          </div>
        )}
      </div>
    </Card>
  );
}