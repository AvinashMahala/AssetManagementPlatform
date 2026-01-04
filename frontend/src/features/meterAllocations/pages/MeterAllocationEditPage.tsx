import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { MeterAllocationForm } from '../components/forms/MeterAllocationForm';
import { useMeterAllocations } from '../hooks/useMeterAllocations';
import type { MeterAllocationInput } from '../types';

export const MeterAllocationEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getMeterAllocation, 
    updateMeterAllocation, 
    isUpdating,
    currentMeterAllocation,
    isLoading 
  } = useMeterAllocations();

  useEffect(() => {
    if (id) {
      getMeterAllocation(id);
    }
  }, [id]);

  const handleSubmit = async (data: MeterAllocationInput) => {
    if (!id) return;
    try {
      await updateMeterAllocation(id, data);
      navigate('/meter-allocations');
    } catch (error) {
      console.error('Failed to update allocation:', error);
    }
  };

  if (isLoading && !currentMeterAllocation) {
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
            Edit Meter Allocation
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update meter allocation details
          </p>
        </div>

        {currentMeterAllocation && (
          <MeterAllocationForm
            initialData={currentMeterAllocation}
            onSubmit={handleSubmit}
            loading={isUpdating}
            isEdit
          />
        )}
      </div>
    </AppLayout>
  );
};
