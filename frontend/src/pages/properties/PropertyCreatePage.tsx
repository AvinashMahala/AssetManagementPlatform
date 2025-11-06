import React from 'react';
import { useCreateProperty } from '../../hooks';
import PropertyFormModern from '../../components/forms/PropertyFormModern';
import type { PropertyInput } from '../../types';

const PropertyCreatePage: React.FC = () => {
  const { mutate: createProperty, loading } = useCreateProperty();

  const handleSubmit = async (data: PropertyInput) => {
    await createProperty(data);
  };

  return (
    <PropertyFormModern
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
};

export default PropertyCreatePage;