import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { UtilitySubscriptionForm } from '../components/forms/UtilitySubscriptionForm';
import { useCreateUtilitySubscription } from '../hooks/useUtilitySubscriptions';
import { useNotifications } from '@/contexts';
import type { UtilitySubscriptionInput } from '../types';

export const UtilitySubscriptionCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: createSubscription, loading: isCreating } = useCreateUtilitySubscription();
  const { showSuccess, showError } = useNotifications();

  const handleSubmit = async (data: UtilitySubscriptionInput) => {
    try {
      await createSubscription(data);
      showSuccess('Utility subscription created successfully');
      navigate('/utility-subscriptions');
    } catch (error) {
      console.error('Failed to create subscription:', error);
      showError('Failed to create subscription');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            New Utility Subscription
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create a new utility service subscription
          </p>
        </div>

        <UtilitySubscriptionForm
          onSubmit={handleSubmit}
          loading={isCreating}
        />
      </div>
    </AppLayout>
  );
};
