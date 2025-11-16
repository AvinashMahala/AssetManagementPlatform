import React from 'react';
import { useCreateProperty } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import PropertyFormTabbed from '../../components/forms/PropertyFormTabbed';
import { AppLayout } from '../../components/layout/AppLayout';
import type { PropertyInput } from '../../types';

const PropertyCreatePageTabbed: React.FC = () => {
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

export default PropertyCreatePageTabbed;