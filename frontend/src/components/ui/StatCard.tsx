import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Card, CardTitle } from './card';
import { Button } from './button';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down';
  description?: string;
  action?: () => void;
  actionLabel?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  trend,
  description,
  action,
  actionLabel = 'View Details',
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 stat-card p-2">
      <div className="flex flex-row items-center justify-between pb-0.5">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-3 w-3 text-muted-foreground stat-icon" />
      </div>
      <div className="space-y-0.5">
        <div className="text-xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center space-x-1">
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span
              className={`text-xs font-medium ${
                trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {change}%
            </span>
            <span className="text-xs text-muted-foreground">from last month</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {action && (
          <Button
            size="sm"
            variant="ghost"
            className="w-full mt-1 justify-between h-6 text-xs px-2"
            onClick={action}
          >
            {actionLabel}
            <ArrowRight className="h-3 w-3" />
          </Button>
        )}
      </div>
    </Card>
  );
};

export default StatCard;