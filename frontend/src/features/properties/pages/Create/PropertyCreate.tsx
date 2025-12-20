import React from 'react';
import { useCreateProperty } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import navigateBackOrFallback from '@/utils/navigation';
import PropertyFormTabbed from '@/features/properties/components/forms/PropertyFormTabbed';
import { AppLayout } from '@/components/layout/AppLayout';
import type { PropertyInput } from '@/features/properties/types';

const PropertyCreate: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: createProperty, loading, error } = useCreateProperty();

  const handleSubmit = async (data: PropertyInput) => {
    try {
      const result = await createProperty(data);
      // Navigate to edit mode on success
      if (result.success && result.data?.id) {
        navigate(`/properties/${result.data.id}/edit`);
      } else {
        navigateBackOrFallback(navigate, '/properties');
      }
    } catch (error) {
      console.error('Failed to create property:', error);
      throw error; // Re-throw to let the form handle it
    }
  };

  return (
    <AppLayout>
      <div className="py-8">
        <PropertyFormTabbed
          onSubmit={handleSubmit}
          loading={loading}
          apiError={error}
        />
      </div>
    </AppLayout>
  );
};

export default PropertyCreate;