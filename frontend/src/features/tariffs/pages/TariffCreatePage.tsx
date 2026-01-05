import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { TariffForm } from '../components/forms/TariffForm';
import { useCreateTariff } from '../hooks/useTariffs';
import { useNotifications } from '@/contexts';
import type { TariffInput } from '../types';

export const TariffCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: createTariff, loading: isCreating } = useCreateTariff();
  const { showSuccess, showError } = useNotifications();

  const handleSubmit = async (data: TariffInput) => {
    try {
      await createTariff(data);
      showSuccess('Tariff created successfully');
      navigate('/tariffs');
    } catch (error) {
      console.error('Failed to create tariff:', error);
      showError('Failed to create tariff');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            New Tariff
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create a new utility tariff structure
          </p>
        </div>

        <TariffForm
          onSubmit={handleSubmit}
          loading={isCreating}
        />
      </div>
    </AppLayout>
  );
};
