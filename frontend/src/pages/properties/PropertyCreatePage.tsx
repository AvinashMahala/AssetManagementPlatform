import React from 'react';
import { useCreateProperty } from '../../hooks';
import { PropertyForm } from '../../components/forms/PropertyForm';
import type { PropertyInput } from '../../types';

const PropertyCreatePage: React.FC = () => {
  const { mutate: createProperty, loading } = useCreateProperty();

  const handleSubmit = async (data: PropertyInput) => {
    await createProperty(data);
  };

  return (
    <PropertyForm
      onSubmit={handleSubmit}
      loading={loading}
      title="Create New Property"
      submitButtonText="Create Property"
    />
  );
};

export default PropertyCreatePage;