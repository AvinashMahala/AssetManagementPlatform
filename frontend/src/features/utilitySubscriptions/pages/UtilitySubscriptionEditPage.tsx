import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { UtilitySubscriptionForm } from '../components/forms/UtilitySubscriptionForm';
import { useUtilitySubscriptions } from '../hooks/useUtilitySubscriptions';
import type { UtilitySubscriptionInput } from '../types';

export const UtilitySubscriptionEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getSubscription, 
    updateSubscription, 
    isUpdating,
    currentSubscription,
    isLoading 
  } = useUtilitySubscriptions();

  useEffect(() => {
    if (id) {
      getSubscription(id);
    }
  }, [id]);

  const handleSubmit = async (data: UtilitySubscriptionInput) => {
    if (!id) return;
    try {
      await updateSubscription(id, data);
      navigate('/utility-subscriptions');
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  if (isLoading && !currentSubscription) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Edit Subscription
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update utility subscription details
          </p>
        </div>

        {currentSubscription && (
          <UtilitySubscriptionForm
            initialData={currentSubscription}
            onSubmit={handleSubmit}
            loading={isUpdating}
            isEdit
          />
        )}
      </div>
    </AppLayout>
  );
};
