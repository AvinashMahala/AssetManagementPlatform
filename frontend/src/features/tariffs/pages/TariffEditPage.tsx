import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { TariffForm } from '../components/forms/TariffForm';
import { useTariffs } from '../hooks/useTariffs';
import type { TariffInput } from '../types';

export const TariffEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getTariff, 
    updateTariff, 
    isUpdating,
    currentTariff,
    isLoading 
  } = useTariffs();

  useEffect(() => {
    if (id) {
      getTariff(id);
    }
  }, [id]);

  const handleSubmit = async (data: TariffInput) => {
    if (!id) return;
    try {
      await updateTariff(id, data);
      navigate('/tariffs');
    } catch (error) {
      console.error('Failed to update tariff:', error);
    }
  };

  if (isLoading && !currentTariff) {
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
            Edit Tariff
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update tariff details and rates
          </p>
        </div>

        {currentTariff && (
          <TariffForm
            initialData={currentTariff}
            onSubmit={handleSubmit}
            loading={isUpdating}
            isEdit
          />
        )}
      </div>
    </AppLayout>
  );
};
