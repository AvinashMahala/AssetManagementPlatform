import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { UtilitySubscriptionForm } from '../components/forms/UtilitySubscriptionForm';
import { useUtilitySubscriptions } from '../hooks/useUtilitySubscriptions';
import type { UtilitySubscriptionInput } from '../types';

export const UtilitySubscriptionCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { createSubscription, isCreating } = useUtilitySubscriptions();

  const handleSubmit = async (data: UtilitySubscriptionInput) => {
    try {
      await createSubscription(data);
      navigate('/utility-subscriptions');
    } catch (error) {
      console.error('Failed to create subscription:', error);
      // Error handling is done in the hook/toast usually
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
