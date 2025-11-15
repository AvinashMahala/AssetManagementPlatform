import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUnit, useUpdateUnit } from '../../hooks';
import { useNotifications } from '../../contexts';
import UnitFormTabbed from '../../components/forms/UnitFormTabbed';
import type { UnitInput } from '../../types/unit';

export const UnitEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: unit, loading: loadingUnit, error: loadError } = useUnit(id!);
  const { mutate: updateUnit, loading: updating } = useUpdateUnit();
  const { showSuccess, showError } = useNotifications();

  const handleSubmit = async (data: UnitInput) => {
    try {
      const response = await updateUnit({ id: id!, data });
      if (response.success) {
        showSuccess('Unit updated successfully!');
        navigate(`/units/${id}`);
      } else {
        showError(response.error?.message || 'Failed to update unit');
      }
    } catch (error) {
      console.error('Failed to update unit:', error);
      showError('Failed to update unit');
    }
  };

  if (loadingUnit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Unit</h2>
          <p className="text-gray-600 mb-4">{typeof loadError === 'string' ? loadError : loadError?.message || 'An error occurred'}</p>
          <button
            onClick={() => navigate('/units')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Units
          </button>
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Unit Not Found</h2>
          <p className="text-gray-600 mb-4">The unit you're trying to edit could not be found.</p>
          <button
            onClick={() => navigate('/units')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Units
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <UnitFormTabbed
        initialData={unit}
        onSubmit={handleSubmit}
        loading={updating}
        isEdit={true}
        unitId={id}
      />
    </div>
  );
};
