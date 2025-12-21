import { Badge } from '../common/badge';
import { CheckCircle, XCircle, Clock, AlertTriangle, Pause, Play } from 'lucide-react';

export type StatusType =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'error'
  | 'warning'
  | 'success'
  | 'available'
  | 'occupied'
  | 'maintenance'
  | 'reserved'
  | 'paid'
  | 'unpaid'
  | 'overdue';

export interface StatusBadgeProps {
  status: StatusType;
  customLabel?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
}

const statusConfig: Record<StatusType, {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  icon: React.ReactNode;
  className?: string;
}> = {
  active: {
    label: 'Active',
    variant: 'default',
    icon: <Play className="h-3 w-3" />,
    className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
  },
  inactive: {
    label: 'Inactive',
    variant: 'secondary',
    icon: <Pause className="h-3 w-3" />,
    className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
  },
  pending: {
    label: 'Pending',
    variant: 'outline',
    icon: <Clock className="h-3 w-3" />,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
  },
  completed: {
    label: 'Completed',
    variant: 'default',
    icon: <CheckCircle className="h-3 w-3" />,
    className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'secondary',
    icon: <XCircle className="h-3 w-3" />,
    className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
  },
  error: {
    label: 'Error',
    variant: 'destructive',
    icon: <XCircle className="h-3 w-3" />,
    className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
  },
  warning: {
    label: 'Warning',
    variant: 'outline',
    icon: <AlertTriangle className="h-3 w-3" />,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
  },
  success: {
    label: 'Success',
    variant: 'default',
    icon: <CheckCircle className="h-3 w-3" />,
    className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
  },
  available: {
    label: 'Available',
    variant: 'default',
    icon: <CheckCircle className="h-3 w-3" />,
    className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
  },
  occupied: {
    label: 'Occupied',
    variant: 'secondary',
    icon: <Pause className="h-3 w-3" />,
    className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
  },
  maintenance: {
    label: 'Maintenance',
    variant: 'outline',
    icon: <AlertTriangle className="h-3 w-3" />,
    className: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
  },
  reserved: {
    label: 'Reserved',
    variant: 'outline',
    icon: <Clock className="h-3 w-3" />,
    className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
  },
  paid: {
    label: 'Paid',
    variant: 'default',
    icon: <CheckCircle className="h-3 w-3" />,
    className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
  },
  unpaid: {
    label: 'Unpaid',
    variant: 'outline',
    icon: <Clock className="h-3 w-3" />,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
  },
  overdue: {
    label: 'Overdue',
    variant: 'destructive',
    icon: <XCircle className="h-3 w-3" />,
    className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
  }
};

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5'
};

export function StatusBadge({
  status,
  customLabel,
  showIcon = true,
  size = 'md',
  variant = 'default'
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const label = customLabel || config.label;

  return (
    <Badge
      variant={variant === 'default' ? config.variant : variant}
      className={`${config.className} ${sizeClasses[size]} flex items-center gap-1.5 w-fit`}
    >
      {showIcon && config.icon}
      {label}
    </Badge>
  );
}

export default StatusBadge;