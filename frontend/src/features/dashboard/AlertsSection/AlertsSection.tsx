import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Card, Button } from '../../../components/ui';
import './AlertsSection.scss';

interface AlertsSectionProps {
  stats: {
    expiringLeases: number;
    overduePayments: number;
  };
}

const AlertsSection: React.FC<AlertsSectionProps> = ({ stats }) => {
  const navigate = useNavigate();

  if (stats.expiringLeases === 0 && stats.overduePayments === 0) {
    return null;
  }

  return (
    <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 alert-card p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-amber-600 alert-icon" />
          <span className="text-sm font-medium text-amber-900 dark:text-amber-300 alert-title">
            Attention Required:
          </span>
          <div className="flex items-center space-x-4">
            {stats.expiringLeases > 0 && (
              <span className="text-sm text-amber-800 dark:text-amber-200">
                {stats.expiringLeases} lease(s) expiring soon
              </span>
            )}
            {stats.overduePayments > 0 && (
              <span className="text-sm text-amber-800 dark:text-amber-200">
                {stats.overduePayments} overdue payment(s)
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          {stats.expiringLeases > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/leases')}
              className="border-amber-300 hover:bg-amber-100 alert-action-btn h-7 px-2"
            >
              Review Leases
            </Button>
          )}
          {stats.overduePayments > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/payments')}
              className="border-amber-300 hover:bg-amber-100 alert-action-btn h-7 px-2"
            >
              Review Payments
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AlertsSection;