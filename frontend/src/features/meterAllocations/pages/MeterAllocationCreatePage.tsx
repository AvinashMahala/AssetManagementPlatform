import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { MeterAllocationForm } from '../components/forms/MeterAllocationForm';
import { useMeterAllocations } from '../hooks/useMeterAllocations';
import type { MeterAllocationInput } from '../types';

export const MeterAllocationCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { createMeterAllocation, isCreating } = useMeterAllocations();

  const handleSubmit = async (data: MeterAllocationInput) => {
    try {
      await createMeterAllocation(data);
      navigate('/meter-allocations');
    } catch (error) {
      console.error('Failed to create allocation:', error);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            New Meter Allocation
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create a new meter allocation rule
          </p>
        </div>

        <MeterAllocationForm
          onSubmit={handleSubmit}
          loading={isCreating}
        />
      </div>
    </AppLayout>
  );
};
