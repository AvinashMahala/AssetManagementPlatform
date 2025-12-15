import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { AlertCircle } from 'lucide-react';

interface PropertyAlertsSectionProps {
  metrics: {
    expiringSoonLeases: number;
    overduePayments: number;
    overdueAmount: number;
  };
  formatCurrency: (amount: number | undefined | null) => string;
  onViewLeases: () => void;
  onViewPayments: () => void;
}

export const PropertyAlertsSection: React.FC<PropertyAlertsSectionProps> = ({
  metrics,
  formatCurrency,
  onViewLeases,
  onViewPayments,
}) => {
  if (metrics.expiringSoonLeases === 0 && metrics.overduePayments === 0) {
    return null;
  }

  return (
    <div className="alerts-section grid gap-4 md:grid-cols-2">
      {metrics.expiringSoonLeases > 0 && (
        <Card className="alert-card alert-warning border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
          <CardHeader className="alert-header pb-3">
            <div className="alert-header-content flex items-center gap-2">
              <AlertCircle className="alert-icon h-5 w-5 text-orange-600" />
              <CardTitle className="alert-title text-base">Expiring Soon</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="alert-content">
            <p className="alert-message text-sm">
              {metrics.expiringSoonLeases} lease{metrics.expiringSoonLeases !== 1 ? 's' : ''} expiring within 30 days
            </p>
            <Button
              variant="link"
              className="alert-action px-0 text-orange-700 dark:text-orange-400"
              onClick={onViewLeases}
            >
              View Leases →
            </Button>
          </CardContent>
        </Card>
      )}
      {metrics.overduePayments > 0 && (
        <Card className="alert-card alert-error border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <CardHeader className="alert-header pb-3">
            <div className="alert-header-content flex items-center gap-2">
              <AlertCircle className="alert-icon h-5 w-5 text-red-600" />
              <CardTitle className="alert-title text-base">Overdue Payments</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="alert-content">
            <p className="alert-message text-sm">
              {metrics.overduePayments} payment{metrics.overduePayments !== 1 ? 's' : ''} overdue • {formatCurrency(metrics.overdueAmount)}
            </p>
            <Button
              variant="link"
              className="alert-action px-0 text-red-700 dark:text-red-400"
              onClick={onViewPayments}
            >
              View Payments →
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};