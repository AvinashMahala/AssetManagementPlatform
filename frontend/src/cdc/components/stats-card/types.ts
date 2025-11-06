export type TrendDirection = 'up' | 'down' | 'neutral';

export interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: TrendDirection;
    label?: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
  onClick?: () => void;
}