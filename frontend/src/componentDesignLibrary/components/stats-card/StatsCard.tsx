import { Card, CardContent, CardHeader, CardTitle } from '../common/card';
import { Button } from '../common/button';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import type { StatsCardProps } from './types';

const variantStyles = {
  default: 'hover:shadow-md transition-shadow',
  success: 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10',
  warning: 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/10',
  error: 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10'
};

const iconColors = {
  default: 'text-muted-foreground',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600'
};

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  action,
  variant = 'default',
  className = '',
  onClick
}: StatsCardProps) {
  const TrendIcon = trend?.direction === 'up' ? TrendingUp : trend?.direction === 'down' ? TrendingDown : Minus;
  const trendColor = trend?.direction === 'up' ? 'text-green-600' : trend?.direction === 'down' ? 'text-red-600' : 'text-gray-500';

  return (
    <Card
      className={`${variantStyles[variant]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className={`p-2 rounded-lg bg-muted/50 ${iconColors[variant]}`}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>

        {description && (
          <p className="text-xs text-muted-foreground mb-2">
            {description}
          </p>
        )}

        {trend && (
          <div className="flex items-center gap-1">
            <TrendIcon className={`h-3 w-3 ${trendColor}`} />
            <span className={`text-xs font-medium ${trendColor}`}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            {trend.label && (
              <span className="text-xs text-muted-foreground">
                {trend.label}
              </span>
            )}
          </div>
        )}

        {action && (
          <Button
            size="sm"
            variant="ghost"
            className="w-full mt-3 justify-between h-8 text-xs px-2 hover:bg-muted/50"
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
            }}
          >
            {action.label}
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default StatsCard;