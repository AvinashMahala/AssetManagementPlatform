import React from 'react';
import { useCreateProperty } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import PropertyFormModern from '../../components/forms/PropertyFormModern';
import { AppLayout } from '../../components/layout/AppLayout';
import type { PropertyInput } from '../../types';

const PropertyCreatePageEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: createProperty, loading, error } = useCreateProperty();

  const handleSubmit = async (data: PropertyInput) => {
    try {
      await createProperty(data);
      // Navigate to properties list on success
      navigate('/properties');
    } catch (error) {
      console.error('Failed to create property:', error);
      throw error; // Re-throw to let the form handle it
    }
  };

  return (
    <AppLayout>
      <PropertyFormModern
        onSubmit={handleSubmit}
        loading={loading}
        apiError={error}
      />
    </AppLayout>
  );
};

export default PropertyCreatePageEnhanced;
