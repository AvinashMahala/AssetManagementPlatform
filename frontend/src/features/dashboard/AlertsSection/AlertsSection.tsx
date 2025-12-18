import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui';
import { AlertCard } from '../../../componentDesignLibrary/components/alert-card';
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

  const messages = [];
  if (stats.expiringLeases > 0) {
    messages.push(`${stats.expiringLeases} lease(s) expiring soon`);
  }
  if (stats.overduePayments > 0) {
    messages.push(`${stats.overduePayments} overdue payment(s)`);
  }

  return (
    <AlertCard
      title="Attention Required:"
      icon={<AlertCircle className="h-4 w-4" />}
      variant="warning"
      messages={messages}
      actions={
        <>
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
        </>
      }
      className="alert-card"
    />
  );
};

export default AlertsSection;