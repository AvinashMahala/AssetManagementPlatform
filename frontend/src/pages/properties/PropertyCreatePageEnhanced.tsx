import React from 'react';
import { useCreateProperty } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import PropertyFormModern from '../../components/forms/PropertyFormModern';
import { AppLayout } from '../../components/layout/AppLayout';
import type { PropertyInput } from '../../types';

const PropertyCreatePageEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: createProperty, loading } = useCreateProperty();

  const handleSubmit = async (data: PropertyInput) => {
    try {
      await createProperty(data);
      // Navigate to properties list on success
      navigate('/properties');
    } catch (error) {
      console.error('Failed to create property:', error);
    }
  };

  return (
    <AppLayout>
      <PropertyFormModern
        onSubmit={handleSubmit}
        loading={loading}
      />
    </AppLayout>
  );
};

export default PropertyCreatePageEnhanced;
