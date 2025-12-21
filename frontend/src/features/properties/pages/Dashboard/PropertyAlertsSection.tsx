import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { AlertCircle } from 'lucide-react';
import styles from './PropertyAlertsSection.module.scss';

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
    <div className={styles.alertsSection}>
      {metrics.expiringSoonLeases > 0 && (
        <Card className={`${styles.alertCard} ${styles.alertWarning}`}>
          <CardHeader className="pb-3">
            <div className={`${styles.alertHeaderContent} flex items-center gap-2`}>
              <AlertCircle className={`${styles.alertIcon} h-5 w-5 text-orange-600`} />
              <CardTitle className={`${styles.alertTitle} text-base`}>Expiring Soon</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className={`${styles.alertMessage} text-sm`}>
              {metrics.expiringSoonLeases} lease{metrics.expiringSoonLeases !== 1 ? 's' : ''} expiring within 30 days
            </p>
            <Button
              variant="link"
              className={`${styles.alertAction} px-0 text-orange-700 dark:text-orange-400`}
              onClick={onViewLeases}
            >
              View Leases →
            </Button>
          </CardContent>
        </Card>
      )}
      {metrics.overduePayments > 0 && (
        <Card className={`${styles.alertCard} ${styles.alertError}`}>
          <CardHeader className="pb-3">
            <div className={`${styles.alertHeaderContent} flex items-center gap-2`}>
              <AlertCircle className={`${styles.alertIcon} h-5 w-5 text-red-600`} />
              <CardTitle className={`${styles.alertTitle} text-base`}>Overdue Payments</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className={`${styles.alertMessage} text-sm`}>
              {metrics.overduePayments} payment{metrics.overduePayments !== 1 ? 's' : ''} overdue • {formatCurrency(metrics.overdueAmount)}
            </p>
            <Button
              variant="link"
              className={`${styles.alertAction} px-0 text-red-700 dark:text-red-400`}
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